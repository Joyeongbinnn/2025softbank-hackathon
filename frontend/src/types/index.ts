// Domain models and types for Yoitang Auto Deploy

export type Language = 'ko' | 'en' | 'ja'

export type DeploymentStatus = 'success' | 'failed' | 'running' | 'idle' | 'deploying'
export type PipelineStageStatus = 'waiting' | 'running' | 'success' | 'failed'
export type EnvironmentType = 'dev' | 'staging' | 'prod'

export interface Tenant {
  id: string
  name: string // e.g., "Team Alpha"
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  tenantId: string
  name: string // Project name
  gitUrl: string
  branch: string
  domainPrefix: string // e.g., "team1" -> "team1.yoitang.cloud"
  hasBackend: boolean
  hasFrontend: boolean
  createdAt: Date
  updatedAt: Date
  environments: Environment[]
}

export interface Environment {
  id: string
  serviceId: string
  name: string // e.g., "dev", "staging", "prod"
  type: EnvironmentType
  status: DeploymentStatus
  url: string // e.g., "https://dev.team1.yoitang.cloud"
  lastDeploymentId?: string
  lastDeploymentTime?: Date
  healthStatus?: 'healthy' | 'degraded' | 'failed'
  commitHash?: string
  commitMessage?: string
}

export interface Deployment {
  id: string
  serviceId: string
  environmentId: string
  commitHash: string
  commitMessage: string
  branch: string
  status: DeploymentStatus
  triggeredBy: 'manual' | 'push' | 'schedule'
  startTime: Date
  endTime?: Date
  duration?: number // in seconds
}

export interface PipelineStage {
  id: string
  name: string
  status: PipelineStageStatus
  startTime?: Date
  endTime?: Date
  duration?: string // formatted string
  logs?: string
}

export interface Pipeline {
  id: string
  serviceId: string
  environmentId: string
  stages: PipelineStage[]
  currentDeploymentId?: string
}

export interface DashboardStats {
  totalServices: number
  successfulDeploymentsToday: number
  failedDeploymentsToday: number
  deploymentSuccessRate: number // percentage
  activeEnvironments: number
  totalDeployments: number
}

export interface CreateServicePayload {
  name: string
  tenantId: string
  gitUrl: string
  branch: string
  domainPrefix: string
  hasBackend: boolean
  hasFrontend: boolean
  useJenkinsPipeline: boolean
  useK3sNamespace: boolean
  useTemplates: boolean
}

export interface TenantSettings {
  tenantId: string
  defaultBranch: string
  defaultCpuRequest?: string
  defaultMemoryRequest?: string
  defaultCpuLimit?: string
  defaultMemoryLimit?: string
  namespaceNamingRule?: string
  jenkinsUrl?: string
  ecrRegistry?: string
  k3sApiEndpoint?: string
}
