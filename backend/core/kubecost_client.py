from typing import Any, Dict, List

import httpx
from fastapi import HTTPException


class KubecostClient:
    def __init__(self) -> None:
        self.base_url = "https://cost.yoitang.cloud"

    async def allocation(
        self,
        window: str,
        aggregation: str,
        namespace: str | None = None,
        accumulate: bool | None = None,
    ) -> Dict[str, Any]:
        """
        /model/allocation 호출
        예:
          GET https://cost.yoitang.cloud/model/allocation?window=7d&aggregation=namespace&namespace=team1
        """
        params: Dict[str, Any] = {
            "window": window,
            "aggregation": aggregation,
        }
        if namespace:
            params["namespace"] = namespace
        if accumulate is not None:
            params["accumulate"] = str(accumulate).lower()

        async with httpx.AsyncClient(verify=True) as client:
            try:
                resp = await client.get(
                    f"{self.base_url}/model/allocation",
                    params=params,
                    timeout=10.0,
                )
                resp.raise_for_status()
            except Exception as e:
                raise HTTPException(status_code=502, detail=f"Kubecost allocation 호출 실패: {e}")

        data = resp.json()
        # Allocation API 표준 응답 형태: { "code": 200, "data": [ { ... }, { ... } ] }
        if not isinstance(data, dict) or "data" not in data:
            raise HTTPException(status_code=502, detail=f"예상치 못한 Kubecost 응답 형식: {data}")

        return data