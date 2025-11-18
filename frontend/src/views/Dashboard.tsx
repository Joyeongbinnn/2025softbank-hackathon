import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Bell, Plus, Eye } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { t } from "@/lib/i18n"
import { mockServices, mockDeploymentHistory, calculateDashboardStats, mockDeployments } from "@/utils/mockData"
import EnvironmentCard from "@/components/dashboard/EnvironmentCard"
import DeploymentHistory from "@/components/dashboard/DeploymentHistory"
import SummaryCard from "@/components/dashboard/SummaryCard"

const Dashboard = () => {
  const { language } = useLanguage()
  const dashboardStats = calculateDashboardStats(mockServices)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{t(language, 'dashboard')}</h1>
            <p className="text-muted-foreground">
              {language === 'ko'
                ? '모든 서비스와 배포 현황을 한 눈에 확인하세요'
                : language === 'en'
                  ? 'Monitor all services and deployments'
                  : 'すべてのサービスとデプロイメントを監視'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                {t(language, 'settings_btn')}
              </Button>
            </Link>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              {t(language, 'notification')}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div>
          <h2 className="text-xl font-semibold mb-4">{t(language, 'dashboardSummary')}</h2>
          <SummaryCard stats={dashboardStats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Active Environments */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t(language, 'environment')}</h2>
                <Badge variant="secondary" className="bg-success/20 text-success">
                  {dashboardStats.activeEnvironments} {t(language, 'activeEnvironments')}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {mockServices.map((service) => (
                  <div key={service.id} className="space-y-3">
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/50 bg-muted/30">
                      <h3 className="font-semibold text-sm">{service.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {service.environments.length} {t(language, 'environment')}
                      </Badge>
                    </div>
                    <div className="grid gap-2">
                      {service.environments.slice(0, 2).map((env) => (
                        <EnvironmentCard
                          key={env.id}
                          environment={env}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Deployments Table */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{t(language, 'recentDeployments')}</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {mockDeployments.slice(0, 5).map((deployment) => {
                      const service = mockServices.find(s => s.id === deployment.serviceId)
                      const statusBgColor =
                        deployment.status === 'success'
                          ? 'bg-success/10'
                          : deployment.status === 'failed'
                            ? 'bg-destructive/10'
                            : 'bg-warning/10'
                      const statusTextColor =
                        deployment.status === 'success'
                          ? 'text-success'
                          : deployment.status === 'failed'
                            ? 'text-destructive'
                            : 'text-warning'

                      return (
                        <div key={deployment.id} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="font-medium truncate">{service?.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {deployment.branch}
                                </Badge>
                                <Badge
                                  className={`text-xs ${statusBgColor} ${statusTextColor}`}
                                  variant="outline"
                                >
                                  {deployment.status === 'success'
                                    ? t(language, 'success')
                                    : deployment.status === 'failed'
                                      ? t(language, 'failed')
                                      : t(language, 'running')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{deployment.commitMessage}</p>
                            </div>
                            <div className="text-right space-y-1 ml-4">
                              <p className="text-xs text-muted-foreground">
                                {new Date(deployment.startTime).toLocaleString(language === 'ko' ? 'ko-KR' : language === 'en' ? 'en-US' : 'ja-JP')}
                              </p>
                              {deployment.duration && (
                                <p className="text-xs font-medium">
                                  {Math.round(deployment.duration / 60)}m
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t(language, 'actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/new-project" className="w-full">
                  <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Plus className="h-4 w-4 mr-2" />
                    {t(language, 'createNewService')}
                  </Button>
                </Link>
                <Link to="/pipeline" className="w-full">
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    {t(language, 'viewAllPipelines')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Deployment History */}
            <DeploymentHistory />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
