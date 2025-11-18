// Mock data for Yoitang Auto Deploy
// Re-exporting types from @/types for backward compatibility
export type {
  Tenant,
  Service,
  Environment as EnvironmentType,
  Deployment,
  Pipeline,
  PipelineStage,
  DashboardStats,
  CreateServicePayload,
  TenantSettings,
} from '@/types'

import {
  Tenant,
  Service,
  Environment,
  Deployment,
  Pipeline,
  PipelineStage,
  DashboardStats,
} from '@/types'

// For backward compatibility with existing components using old interfaces
export interface DeploymentHistory {
  id: string
  time: string
  branch: string
  status: 'success' | 'failed'
  commitMessage: string
  commitHash: string
}

// Tenant (Team) data
export const mockTenant: Tenant = {
  id: 'tenant-1',
  name: 'Team Alpha',
  description: 'Main development team',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
}

// Services (Projects) data
export const mockServices: Service[] = [
  {
    id: 'service-1',
    tenantId: 'tenant-1',
    name: 'Backend API',
    gitUrl: 'https://github.com/team/backend-api.git',
    branch: 'main',
    domainPrefix: 'api-team1',
    hasBackend: true,
    hasFrontend: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
    environments: [
      {
        id: 'env-1-dev',
        serviceId: 'service-1',
        name: 'Development',
        type: 'dev',
        status: 'success',
        url: 'https://dev-api-team1.yoitang.cloud',
        lastDeploymentTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        healthStatus: 'healthy',
        commitHash: 'a3f4c21',
        commitMessage: 'Add authentication endpoints',
      },
      {
        id: 'env-1-prod',
        serviceId: 'service-1',
        name: 'Production',
        type: 'prod',
        status: 'success',
        url: 'https://api-team1.yoitang.cloud',
        lastDeploymentTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
        healthStatus: 'healthy',
        commitHash: 'b7e8d92',
        commitMessage: 'Fix critical bug in payment module',
      },
    ],
  },
  {
    id: 'service-2',
    tenantId: 'tenant-1',
    name: 'Frontend Dashboard',
    gitUrl: 'https://github.com/team/frontend-dashboard.git',
    branch: 'main',
    domainPrefix: 'dashboard-team1',
    hasBackend: false,
    hasFrontend: true,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-15'),
    environments: [
      {
        id: 'env-2-dev',
        serviceId: 'service-2',
        name: 'Development',
        type: 'dev',
        status: 'deploying',
        url: 'https://dev-dashboard-team1.yoitang.cloud',
        lastDeploymentTime: new Date(Date.now() - 10 * 60 * 1000),
        healthStatus: 'degraded',
        commitHash: 'c9a1f44',
        commitMessage: 'UI improvements for deployment view',
      },
      {
        id: 'env-2-staging',
        serviceId: 'service-2',
        name: 'Staging',
        type: 'staging',
        status: 'success',
        url: 'https://staging-dashboard-team1.yoitang.cloud',
        lastDeploymentTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
        healthStatus: 'healthy',
        commitHash: 'd2c5e88',
        commitMessage: 'Merge PR: Add dark mode support',
      },
    ],
  },
  {
    id: 'service-3',
    tenantId: 'tenant-1',
    name: 'Analytics Service',
    gitUrl: 'https://github.com/team/analytics-service.git',
    branch: 'main',
    domainPrefix: 'analytics-team1',
    hasBackend: true,
    hasFrontend: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    environments: [
      {
        id: 'env-3-prod',
        serviceId: 'service-3',
        name: 'Production',
        type: 'prod',
        status: 'success',
        url: 'https://analytics-team1.yoitang.cloud',
        lastDeploymentTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        healthStatus: 'healthy',
        commitHash: 'e4f6g89',
        commitMessage: 'Release: Analytics v2.1 with real-time metrics',
      },
    ],
  },
]

// Environments data (for backward compatibility)
export const mockEnvironments: Environment[] = mockServices
  .flatMap(s => s.environments)
  .map(env => ({
    ...env,
    // Add backward compatible fields if needed
  }))

// Deployments data
export const mockDeployments: Deployment[] = [
  {
    id: 'deploy-1',
    serviceId: 'service-1',
    environmentId: 'env-1-prod',
    commitHash: 'b7e8d92',
    commitMessage: 'Fix critical bug in payment module',
    branch: 'main',
    status: 'success',
    triggeredBy: 'push',
    startTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 5 * 60 * 60 * 1000 + 3 * 60 * 1000),
    duration: 180,
  },
  {
    id: 'deploy-2',
    serviceId: 'service-2',
    environmentId: 'env-2-dev',
    commitHash: 'c9a1f44',
    commitMessage: 'UI improvements for deployment view',
    branch: 'develop',
    status: 'running',
    triggeredBy: 'push',
    startTime: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: 'deploy-3',
    serviceId: 'service-1',
    environmentId: 'env-1-dev',
    commitHash: 'a3f4c21',
    commitMessage: 'Add authentication endpoints',
    branch: 'develop',
    status: 'success',
    triggeredBy: 'manual',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2 * 60 * 1000),
    duration: 120,
  },
  {
    id: 'deploy-4',
    serviceId: 'service-3',
    environmentId: 'env-3-prod',
    commitHash: 'e4f6g89',
    commitMessage: 'Release: Analytics v2.1 with real-time metrics',
    branch: 'main',
    status: 'success',
    triggeredBy: 'push',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 4 * 60 * 1000),
    duration: 240,
  },
  {
    id: 'deploy-5',
    serviceId: 'service-2',
    environmentId: 'env-2-staging',
    commitHash: 'd2c5e88',
    commitMessage: 'Merge PR: Add dark mode support',
    branch: 'staging',
    status: 'success',
    triggeredBy: 'push',
    startTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 8 * 60 * 60 * 1000 + 2.5 * 60 * 1000),
    duration: 150,
  },
]

// Mock deployment history for backward compatibility
export const mockDeploymentHistory: DeploymentHistory[] = [
  {
    id: '1',
    time: '10:32',
    branch: 'main',
    status: 'success',
    commitMessage: 'Fix critical bug in payment module',
    commitHash: 'b7e8d92',
  },
  {
    id: '2',
    time: '09:15',
    branch: 'develop',
    status: 'success',
    commitMessage: 'Add authentication endpoints',
    commitHash: 'a3f4c21',
  },
  {
    id: '3',
    time: '08:47',
    branch: 'staging',
    status: 'success',
    commitMessage: 'Merge PR: Add dark mode support',
    commitHash: 'd2c5e88',
  },
  {
    id: '4',
    time: '어제 18:22',
    branch: 'main',
    status: 'failed',
    commitMessage: 'Database migration',
    commitHash: 'c5e6f90',
  },
]

// Pipeline stages data
export const mockPipelineStages: PipelineStage[] = [
  {
    id: '1',
    name: 'Git Clone',
    status: 'success',
    duration: '12초',
  },
  {
    id: '2',
    name: 'Build & Test',
    status: 'success',
    duration: '2분 34초',
  },
  {
    id: '3',
    name: 'Docker Build & Push',
    status: 'success',
    duration: '45초',
  },
  {
    id: '4',
    name: 'k3s Deploy',
    status: 'running',
    duration: '1분 12초',
  },
  {
    id: '5',
    name: 'Health Check',
    status: 'waiting',
  },
]

export const mockLogs = `[2024-01-15 10:32:15] Starting deployment process...
[2024-01-15 10:32:16] Checking out code from GitHub...
[2024-01-15 10:32:18] ✓ Code checkout successful
[2024-01-15 10:32:18] Building Docker image...
[2024-01-15 10:32:20] Step 1/8 : FROM node:18-alpine
[2024-01-15 10:32:21] ---> Pulling from library/node
[2024-01-15 10:32:45] Step 2/8 : WORKDIR /app
[2024-01-15 10:32:45] ---> Running in 3f2a1b4c5d6e
[2024-01-15 10:33:12] Step 3/8 : COPY package*.json ./
[2024-01-15 10:33:13] ---> 7a8b9c0d1e2f
[2024-01-15 10:33:45] Step 4/8 : RUN npm ci --production
[2024-01-15 10:34:52] ✓ Docker image built successfully
[2024-01-15 10:34:53] Pushing image to ECR...
[2024-01-15 10:35:38] ✓ Image pushed to ECR
[2024-01-15 10:35:39] Applying k3s configuration...
[2024-01-15 10:36:20] Creating deployment in k3s...
[2024-01-15 10:36:51] ✓ Deployment successful`

export const techStackOptions = [
  'React',
  'Vue',
  'Angular',
  'Next.js',
  'Django',
  'FastAPI',
  'Express',
  'NestJS',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Nginx',
  'Docker',
  'Kubernetes',
]

export const teamOptions = [
  { value: 'tenant-1', label: 'Team Alpha' },
  { value: 'tenant-2', label: 'Team Beta' },
  { value: 'tenant-3', label: 'Team Gamma' },
]

export const environmentOptions = [
  { value: 'dev', label: 'Development' },
  { value: 'staging', label: 'Staging' },
  { value: 'prod', label: 'Production' },
]

// Dashboard statistics calculation function
export const calculateDashboardStats = (services: Service[]): DashboardStats => {
  const totalServices = services.length
  const totalEnvironments = services.flatMap(s => s.environments).length

  // Calculate deployments from today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deploymentsToday = mockDeployments.filter(d => {
    const deployDate = new Date(d.startTime)
    deployDate.setHours(0, 0, 0, 0)
    return deployDate.getTime() === today.getTime()
  })

  const successfulToday = deploymentsToday.filter(d => d.status === 'success').length
  const failedToday = deploymentsToday.filter(d => d.status === 'failed').length

  const successRate =
    mockDeployments.length > 0
      ? Math.round((mockDeployments.filter(d => d.status === 'success').length / mockDeployments.length) * 100)
      : 100

  return {
    totalServices,
    successfulDeploymentsToday: successfulToday,
    failedDeploymentsToday: failedToday,
    deploymentSuccessRate: successRate,
    activeEnvironments: services.flatMap(s => s.environments).filter(e => e.status !== 'idle').length,
    totalDeployments: mockDeployments.length,
  }
}

// Simulated async function
export const simulateDeployment = (duration: number = 2000): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}
