import time
from typing import Any, Dict, List

from fastapi import APIRouter, Query

from core.prometheus_client import PrometheusClient
from core.kubecost_client import KubecostClient

router = APIRouter(prefix="/namespaces", tags=["namespace-metrics"])

prom = PrometheusClient()
kc = KubecostClient()


def _extract_single_value(result: List[Dict[str, Any]]) -> float:
    """
    Prometheus instant query 결과에서 첫 번째 value만 가져와 float로 변환.
    result 예:
      [
        {
          "metric": {...},
          "value": [ <timestamp>, "<string_value>" ]
        }
      ]
    """
    if not result:
        return 0.0
    try:
        return float(result[0]["value"][1])
    except (KeyError, IndexError, TypeError, ValueError):
        return 0.0


@router.get("/{namespace}/resource-usage")
async def get_namespace_resource_usage(
    namespace: str,
    minutes: int = Query(60, ge=5, le=24 * 60, description="조회 기간 (분 단위)"),
    step_sec: int = Query(60, ge=10, le=3600, description="샘플링 간격 (초)"),
):
    """
    Namespace 기준 CPU / Memory 사용량 타임시리즈 + 효율(efficiency)

    - CPU 사용량:
        node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate5m{namespace="<ns>"}
    - 메모리 사용량:
        node_namespace_pod_container:container_memory_working_set_bytes{namespace="<ns>"}
    - Request (CPU/Memory):
        namespace_cpu:kube_pod_container_resource_requests:sum{namespace="<ns>"}
        namespace_memory:kube_pod_container_resource_requests:sum{namespace="<ns>"}
    """
    now = int(time.time())
    start = now - minutes * 60
    end = now

    # 실제 metric 목록에 있는 이름 사용
    cpu_query = (
        'sum('
        f'node_namespace_pod_container:container_cpu_usage_seconds_total:sum_rate5m'
        f'{{namespace="{namespace}"}}'
        ')'
    )
    mem_query = (
        'sum('
        f'node_namespace_pod_container:container_memory_working_set_bytes'
        f'{{namespace="{namespace}"}}'
        ')'
    )

    cpu_series = await prom.query_range(cpu_query, start, end, step_sec)
    mem_series = await prom.query_range(mem_query, start, end, step_sec)

    cpu_points: List[Dict[str, Any]] = []
    if cpu_series:
        # 단일 시리즈라고 가정 → 첫 번째 시리즈 사용
        for ts, value in cpu_series[0].get("values", []):
            try:
                cpu_points.append({"timestamp": int(ts), "cores": float(value)})
            except ValueError:
                continue

    mem_points: List[Dict[str, Any]] = []
    if mem_series:
        for ts, value in mem_series[0].get("values", []):
            try:
                mem_points.append({"timestamp": int(ts), "bytes": float(value)})
            except ValueError:
                continue

    # Efficiency 계산용: 현재 시점 request vs usage
    cpu_req_query = (
        f'namespace_cpu:kube_pod_container_resource_requests:sum'
        f'{{namespace="{namespace}"}}'
    )
    mem_req_query = (
        f'namespace_memory:kube_pod_container_resource_requests:sum'
        f'{{namespace="{namespace}"}}'
    )

    cpu_req_res = await prom.query_instant(cpu_req_query)
    mem_req_res = await prom.query_instant(mem_req_query)

    cpu_req = _extract_single_value(cpu_req_res)
    mem_req = _extract_single_value(mem_req_res)

    cpu_now = cpu_points[-1]["cores"] if cpu_points else 0.0
    mem_now = mem_points[-1]["bytes"] if mem_points else 0.0

    cpu_eff = cpu_now / cpu_req if cpu_req > 0 else 0.0
    mem_eff = mem_now / mem_req if mem_req > 0 else 0.0

    return {
        "namespace": namespace,
        "cpu": cpu_points,       # [{ timestamp, cores }]
        "memory": mem_points,    # [{ timestamp, bytes }]
        "efficiency": {
            "cpu": cpu_eff,      # 0~1 값 → 프론트에서 *100 해서 % 표시
            "memory": mem_eff,
        },
    }


def _sum_namespace_cost_from_allocation(resp: Dict[str, Any], namespace: str) -> float:
    """
    Kubecost Allocation 응답 형식:
      { "code": 200, "data": [ { "<ns>": { totalCost: ... }, "__idle__": {...}, ... }, ... ] }
    에서 해당 namespace의 totalCost 합산

    - data 리스트 안에 None 이나 dict 가 아닌 값이 섞여 있을 수 있으므로 방어 코드 추가
    - 나중에 구조가 바뀌면 여기서 한 번만 수정하면 됨
    """
    total = 0.0
    data_list = resp.get("data", [])

    for bucket in data_list:
        if not isinstance(bucket, dict):
            continue

        # 1) 구버전 형태: { "team1": { ... }, "__idle__": {...}, ... }
        if namespace in bucket:
            ns_obj = bucket.get(namespace)
        # 2) 혹시 신버전 형태: { "allocations": { "team1": { ... }, ... } }
        elif isinstance(bucket.get("allocations"), dict):
            ns_obj = bucket["allocations"].get(namespace)
        else:
            ns_obj = None

        if not ns_obj:
            continue

        try:
            total += float(ns_obj.get("totalCost", 0.0))
        except (TypeError, ValueError):
            continue

    return total


@router.get("/{namespace}/cost-summary")
async def get_namespace_cost_summary(namespace: str):
    """
    Kubecost Allocation API를 이용한 namespace별 비용 요약
    - today
    - 7d
    - month (monthToDate 느낌으로 사용)
    """
    today_alloc = await kc.allocation(window="today", aggregation="namespace", namespace=namespace)
    last7_alloc = await kc.allocation(window="7d", aggregation="namespace", namespace=namespace)
    month_alloc = await kc.allocation(window="month", aggregation="namespace", namespace=namespace)

    today_cost = _sum_namespace_cost_from_allocation(today_alloc, namespace)
    last7_cost = _sum_namespace_cost_from_allocation(last7_alloc, namespace)
    month_cost = _sum_namespace_cost_from_allocation(month_alloc, namespace)

    return {
        "namespace": namespace,
        "currency": "USD",   # 필요하면 Kubecost 설정에서 끌어오는 로직 추가 가능
        "today": today_cost,
        "last7d": last7_cost,
        "monthToDate": month_cost,
    }


@router.get("/{namespace}/top-workloads")
async def get_namespace_top_workloads(
    namespace: str,
    window: str = Query("7d", description="Kubecost window (예: 24h, 7d, month)"),
    limit: int = Query(5, ge=1, le=20),
):
    """
    Kubecost Allocation API:
      aggregation=namespace,controller
    → 해당 namespace 내에서 비용이 큰 워크로드 TOP N
    """
    alloc = await kc.allocation(
        window=window,
        aggregation="namespace,controller",
        namespace=None,  # aggregation에 namespace 포함되어 있으니 여기선 전체 받아서 properties.namespace로 필터
    )

    data_list = alloc.get("data") or []

    # 워크로드 이름별로 값 합산
    agg: Dict[str, Dict[str, float]] = {}

    for bucket in data_list:
        # None 이나 dict 아닌 값은 스킵
        if not isinstance(bucket, dict):
            continue

        # bucket: { "<name>": { ... allocation ... }, ... }
        for alloc_name, alloc_obj in bucket.items():
            # idle/unallocated 등은 스킵
            if alloc_name in ("__idle__", "__unallocated__", "__unmounted__"):
                continue

            # alloc_obj 가 dict 가 아니면 스킵
            if not isinstance(alloc_obj, dict):
                continue

            props = alloc_obj.get("properties") or {}
            ns = props.get("namespace")
            if ns != namespace:
                continue

            wl_name = props.get("controller") or alloc_name

            entry = agg.setdefault(
                wl_name,
                {
                    "totalCost": 0.0,
                    "cpuCoreUsageAverage": 0.0,
                    "cpuCoreRequestAverage": 0.0,
                    "ramByteUsageAverage": 0.0,
                    "ramByteRequestAverage": 0.0,
                },
            )

            for key in entry.keys():
                try:
                    entry[key] += float(alloc_obj.get(key, 0.0))
                except (TypeError, ValueError):
                    continue

    workloads = [{"name": name, **vals} for name, vals in agg.items()]
    workloads.sort(key=lambda x: x["totalCost"], reverse=True)
    top_n = workloads[:limit]

    return {
        "namespace": namespace,
        "window": window,
        "workloads": top_n,
    }


@router.get("/{namespace}/health")
async def get_namespace_health(namespace: str):
    """
    Namespace health:
    - 컨테이너 재시작 수 합계
    - Running / Failed Pod 개수
    """
    queries = {
        "restarts_total": (
            f'sum(kube_pod_container_status_restarts_total'
            f'{{namespace="{namespace}"}})'
        ),
        "pods_running": (
            f'sum(kube_pod_status_phase'
            f'{{namespace="{namespace}",phase="Running"}})'
        ),
        "pods_failed": (
            f'sum(kube_pod_status_phase'
            f'{{namespace="{namespace}",phase="Failed"}})'
        ),
    }

    results: Dict[str, float] = {}
    for key, q in queries.items():
        res = await prom.query_instant(q)
        results[key] = _extract_single_value(res)

    return {
        "namespace": namespace,
        "restarts_total": results["restarts_total"],
        "pods": {
            "running": results["pods_running"],
            "failed": results["pods_failed"],
        },
    }