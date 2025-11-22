// src/lib/api.ts - API abstraction layer for backend integration
// Currently returns mock data; ready to be replaced with actual REST/GraphQL API calls

import {
  DashboardStats,
  Deployment,
  Pipeline,
  Service,
  Tenant,
  TenantSettings,
  CreateServicePayload,
} from '@/types'
import {
  mockTenant,
  mockServices,
  mockEnvironments,
  mockDeployments,
  mockPipelineStages,
  calculateDashboardStats,
} from '@/utils/mockData'

// Simulate API latency
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

export const api = {
  // Tenant APIs
  async getTenant(tenantId: string): Promise<Tenant> {
    await delay()
    return mockTenant
  },

  // Service/Project APIs
  async listServices(tenantId: string): Promise<Service[]> {
    await delay()
    return mockServices.filter(s => s.tenantId === tenantId)
  },

  async getService(serviceId: string): Promise<Service> {
    await delay()
    const service = mockServices.find(s => s.id === serviceId)
    if (!service) throw new Error('Service not found')
    return service
  },

  async createService(payload: CreateServicePayload): Promise<Service> {
    await delay(2000) // Simulate longer creation time
    const newService: Service = {
      id: `service-${Date.now()}`,
      tenantId: payload.tenantId,
      name: payload.name,
      gitUrl: payload.gitUrl,
      branch: payload.branch,
      domainPrefix: payload.domainPrefix,
      hasBackend: payload.hasBackend,
      hasFrontend: payload.hasFrontend,
      createdAt: new Date(),
      updatedAt: new Date(),
      environments: [
        {
          id: `env-${Date.now()}-1`,
          serviceId: `service-${Date.now()}`,
          name: 'dev',
          type: 'dev',
          status: 'idle',
          url: `https://dev.${payload.domainPrefix}.yoitang.cloud`,
        },
        {
          id: `env-${Date.now()}-2`,
          serviceId: `service-${Date.now()}`,
          name: 'prod',
          type: 'prod',
          status: 'idle',
          url: `https://${payload.domainPrefix}.yoitang.cloud`,
        },
      ],
    }
    return newService
  },

  // Dashboard APIs
  async getDashboardData(tenantId: string): Promise<{
    stats: DashboardStats
    services: Service[]
    recentDeployments: Deployment[]
  }> {
    await delay()
    const services = mockServices.filter(s => s.tenantId === tenantId)
    const stats = calculateDashboardStats(services)
    return {
      stats,
      services,
      recentDeployments: mockDeployments.slice(0, 5),
    }
  },

  // Pipeline APIs
  async getPipelineDetail(serviceId: string, environmentId: string): Promise<{
    service: Service
    pipeline: Pipeline
    deployments: Deployment[]
  }> {
    await delay()
    const service = mockServices.find(s => s.id === serviceId)
    if (!service) throw new Error('Service not found')

    const pipeline: Pipeline = {
      id: `pipeline-${serviceId}-${environmentId}`,
      serviceId,
      environmentId,
      stages: mockPipelineStages,
    }

    const deployments = mockDeployments.filter(
      d => d.serviceId === serviceId && d.environmentId === environmentId
    )

    return {
      service,
      pipeline,
      deployments,
    }
  },

  // Deployment APIs
  async listDeployments(tenantId: string, serviceId?: string): Promise<Deployment[]> {
    await delay()
    let deployments = mockDeployments
    if (serviceId) {
      deployments = deployments.filter(d => d.serviceId === serviceId)
    }
    return deployments.slice(0, 20)
  },

  async getDeployment(deploymentId: string): Promise<Deployment> {
    await delay()
    const deployment = mockDeployments.find(d => d.id === deploymentId)
    if (!deployment) throw new Error('Deployment not found')
    return deployment
  },

  // Settings APIs
  async getTenantSettings(tenantId: string): Promise<TenantSettings> {
    await delay()
    return {
      tenantId,
      defaultBranch: 'main',
      defaultCpuRequest: '100m',
      defaultMemoryRequest: '128Mi',
      defaultCpuLimit: '500m',
      defaultMemoryLimit: '512Mi',
      namespaceNamingRule: '{tenant}-{service}',
      jenkinsUrl: 'https://jenkins.yoitang.cloud',
      ecrRegistry: '123456789.dkr.ecr.ap-northeast-2.amazonaws.com',
      k3sApiEndpoint: 'https://k3s.yoitang.cloud',
    }
  },

  async updateTenantSettings(tenantId: string, settings: Partial<TenantSettings>): Promise<TenantSettings> {
    await delay(1000)
    return {
      tenantId,
      ...settings,
      defaultBranch: settings.defaultBranch || 'main',
      defaultCpuRequest: settings.defaultCpuRequest || '100m',
      defaultMemoryRequest: settings.defaultMemoryRequest || '128Mi',
      defaultCpuLimit: settings.defaultCpuLimit || '500m',
      defaultMemoryLimit: settings.defaultMemoryLimit || '512Mi',
      namespaceNamingRule: settings.namespaceNamingRule || '{tenant}-{service}',
      jenkinsUrl: settings.jenkinsUrl || 'https://jenkins.yoitang.cloud',
      ecrRegistry: settings.ecrRegistry || '123456789.dkr.ecr.ap-northeast-2.amazonaws.com',
      k3sApiEndpoint: settings.k3sApiEndpoint || 'https://k3s.yoitang.cloud',
    }
  },

  // Environment APIs
  async getEnvironment(environmentId: string) {
    await delay()
    return mockEnvironments.find(e => e.id === environmentId)
  },

  async triggerDeployment(serviceId: string, environmentId: string, branch?: string): Promise<Deployment> {
    await delay(1000)
    const deployment: Deployment = {
      id: `deploy-${Date.now()}`,
      serviceId,
      environmentId,
      commitHash: 'abc123def456',
      commitMessage: 'Triggered deployment',
      branch: branch || 'main',
      status: 'running',
      triggeredBy: 'manual',
      startTime: new Date(),
    }
    return deployment
  },

  async postDeploy(payload: any): Promise<any> {
  // Hardcode backend base URL as requested
  // NOTE: user provided base includes /api, so compose final deploy URL as {API_BASE}/deploy
  const API_BASE = 'https://www.yoitang.cloud/api'
  const url = `${API_BASE.replace(/\/$/, '')}/deploy`

    // Try the URL, and if it fails (network error or non-ok), try with a trailing slash.
    const tryFetch = async (target: string) => {
      try {
        const r = await fetch(target, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          // keep default redirect behavior (follow)
        })
        return r
      } catch (e) {
        if (e instanceof Error) throw new Error(`Network error when posting deploy to ${target}: ${e.message}`)
        throw new Error(`Unknown network error when posting deploy to ${target}`)
      }
    }

    let res = await tryFetch(url)

    // If initial response is not ok, attempt trailing-slash variant as a fallback
    if (!res.ok) {
      const altUrl = url.endsWith('/') ? url.slice(0, -1) : `${url}/`
      try {
        res = await tryFetch(altUrl)
      } catch (e) {
        // If the retry produced a network error, rethrow with context from both attempts
        if (e instanceof Error) throw new Error(`${e.message} (also failed when trying ${url})`)
        throw e
      }
    }

    if (!res.ok) {
      const text = await res.text()
      // Include final URL so caller can see where it landed
      throw new Error(`Deploy request failed: ${res.status} ${text} (url: ${res.url})`)
    }

    return res.json()
  },

  // GitHub APIs - Direct calls to GitHub API
  async getRepoInfo(repoUrl: string, pat?: string): Promise<{
    is_private: boolean
    owner: string
    repo: string
    branches: string[]
  }> {
    // GitHub URL에서 owner와 repo 추출
    const patterns = [
      /https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/,
      /git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/
    ]
    
    let owner = '', repo = ''
    for (const pattern of patterns) {
      const match = repoUrl.trim().match(pattern)
      if (match) {
        owner = match[1]
        repo = match[2]
        break
      }
    }

    if (!owner || !repo) {
      throw new Error('Invalid GitHub URL format')
    }

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    }
    if (pat) {
      headers['Authorization'] = `token ${pat}`
    }

    try {
      // 1. 저장소 정보 조회
      const repoResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        { headers }
      )

      if (repoResponse.status === 404) {
        throw new Error('Repository not found. Check the URL and PAT if it\'s a private repo.')
      }

      if (repoResponse.status === 401) {
        throw new Error('Invalid PAT or authentication failed')
      }

      if (!repoResponse.ok) {
        throw new Error(`GitHub API error: ${repoResponse.statusText}`)
      }

      const repoData = await repoResponse.json()
      const is_private = repoData.private
      const defaultBranch = repoData.default_branch

      // 2. 브랜치 목록 조회
      let branches: string[] = [defaultBranch]
      try {
        const branchesResponse = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`,
          { headers }
        )

        if (branchesResponse.ok) {
          const branchesData = await branchesResponse.json()
          branches = branchesData.map((b: any) => b.name)
          
          // 기본 브랜치를 맨 앞에 배치
          if (branches.includes(defaultBranch)) {
            branches = branches.filter(b => b !== defaultBranch)
            branches.unshift(defaultBranch)
          }
        }
      } catch (e) {
        // 브랜치 조회 실패해도 기본 브랜치는 있음
        console.warn('Failed to fetch branches:', e)
      }

      return {
        is_private,
        owner,
        repo,
        branches,
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to fetch repository information')
    }
  },

  async getBranches(repoUrl: string, pat?: string): Promise<string[]> {
    try {
      const repoInfo = await this.getRepoInfo(repoUrl, pat)
      return repoInfo.branches
    } catch (error) {
      throw error
    }
  },
}

export default api
