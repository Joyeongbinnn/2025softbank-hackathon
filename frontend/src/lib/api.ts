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
    const res = await fetch('/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Deploy request failed: ${res.status} ${text}`)
    }

    return res.json()
  },
}

export default api
