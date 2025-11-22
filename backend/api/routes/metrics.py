import time
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException, Query

from core.prometheus_client import PrometheusClient
from core.kubecost_client import KubecostClient

router = APIRouter(prefix="/namespaces", tags=["namespace-metrics"])

prom = PrometheusClient()
kc = KubecostClient()