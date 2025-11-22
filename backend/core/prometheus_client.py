import time
from typing import Any, Dict, List

import httpx
from fastapi import HTTPException


class PrometheusClient:
    def __init__(self) -> None:
        self.base_url = "https://prometheus.yoitang.cloud"

    async def query_range(
        self,
        promql: str,
        start: int,
        end: int,
        step: int,
    ) -> List[Dict[str, Any]]:
        """
        GET /api/v1/query_range
        """
        async with httpx.AsyncClient(verify=True) as client:
            try:
                resp = await client.get(
                    f"{self.base_url}/api/v1/query_range",
                    params={
                        "query": promql,
                        "start": start,
                        "end": end,
                        "step": step,
                    },
                    timeout=5.0,
                )
                resp.raise_for_status()
            except Exception as e:
                raise HTTPException(status_code=502, detail=f"Prometheus query_range 실패: {e}")

        data = resp.json()
        if data.get("status") != "success":
            raise HTTPException(status_code=502, detail=f"Prometheus 응답 에러: {data}")

        return data["data"]["result"]

    async def query_instant(self, promql: str, ts: int | None = None) -> List[Dict[str, Any]]:
        """
        GET /api/v1/query
        """
        if ts is None:
            ts = int(time.time())

        async with httpx.AsyncClient(verify=True) as client:
            try:
                resp = await client.get(
                    f"{self.base_url}/api/v1/query",
                    params={
                        "query": promql,
                        "time": ts,
                    },
                    timeout=5.0,
                )
                resp.raise_for_status()
            except Exception as e:
                raise HTTPException(status_code=502, detail=f"Prometheus query 실패: {e}")

        data = resp.json()
        if data.get("status") != "success":
            raise HTTPException(status_code=502, detail=f"Prometheus 응답 에러: {data}")

        return data["data"]["result"]