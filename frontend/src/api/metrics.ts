const API_BASE = (import.meta.env?.VITE_API_BASE as string | undefined)?.replace(/\/$/, "") ?? "https://www.yoitang.cloud"
const METRICS_BASE = `${API_BASE}/api/metrics/namespaces`

const extractErrorMessage = async (res: Response) => {
  try {
    const data = await res.clone().json()
    if (typeof data === "string") return data
    if (typeof data?.detail === "string") return data.detail
    if (typeof data?.message === "string") return data.message
    if (data) return JSON.stringify(data)
  } catch {
    try {
      const text = await res.clone().text()
      if (text) return text
    } catch {
      // ignore
    }
  }
  return `Request failed with status ${res.status}`
}

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res))
  }
  return res.json() as Promise<T>
}

export interface NamespaceResourceUsageResponse {
  namespace: string
  cpu: { timestamp: number; cores: number }[]
  memory: { timestamp: number; bytes: number }[]
  efficiency: {
    cpu: number
    memory: number
  }
}

export interface NamespaceCostSummaryResponse {
  namespace: string
  currency: string
  today: number
  last7d: number
  monthToDate: number
}

export interface NamespaceHealthResponse {
  namespace: string
  restarts_total: number
  pods: {
    running: number
    failed: number
  }
}

export interface NamespaceTopWorkload {
  name: string
  totalCost: number
  cpuCoreUsageAverage: number
  cpuCoreRequestAverage: number
  ramByteUsageAverage: number
  ramByteRequestAverage: number
}

export interface NamespaceTopWorkloadsResponse {
  namespace: string
  window: string
  workloads: NamespaceTopWorkload[]
}

const buildQuery = (params: Record<string, string | number>) => {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => search.append(key, String(value)))
  return `?${search.toString()}`
}

export const getNamespaceResourceUsage = async (
  namespace: string,
  minutes = 60,
  stepSec = 60,
) => {
  const res = await fetch(
    `${METRICS_BASE}/${encodeURIComponent(namespace)}/resource-usage${buildQuery({
      minutes,
      step_sec: stepSec,
    })}`,
  )
  return handleResponse<NamespaceResourceUsageResponse>(res)
}

export const getNamespaceCostSummary = async (namespace: string) => {
  const res = await fetch(`${METRICS_BASE}/${encodeURIComponent(namespace)}/cost-summary`)
  return handleResponse<NamespaceCostSummaryResponse>(res)
}

export const getNamespaceHealth = async (namespace: string) => {
  const res = await fetch(`${METRICS_BASE}/${encodeURIComponent(namespace)}/health`)
  return handleResponse<NamespaceHealthResponse>(res)
}

export const getNamespaceTopWorkloads = async (
  namespace: string,
  window = "7d",
  limit = 5,
) => {
  const res = await fetch(
    `${METRICS_BASE}/${encodeURIComponent(namespace)}/top-workloads${buildQuery({
      window,
      limit,
    })}`,
  )
  return handleResponse<NamespaceTopWorkloadsResponse>(res)
}