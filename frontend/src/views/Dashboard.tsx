import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, Bell, Plus, Eye, Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { t } from "@/lib/i18n"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import EnvironmentCard from "@/components/dashboard/EnvironmentCard"
import DeploymentHistory from "@/components/dashboard/DeploymentHistory"
import SummaryCard from "@/components/dashboard/SummaryCard"
import { useState } from "react"

const Dashboard = () => {
  const { language } = useLanguage()
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)
  
  // TODO: user_id를 실제 사용자 인증에서 가져오도록 수정 필요
  const userId = 1 // 임시로 하드코딩
  
  const { data: services, isLoading, isError, error } = useQuery({
    queryKey: ['services', userId],
    queryFn: () => api.getServicesByUserId(userId),
  })

  const { data: totalServices = 0 } = useQuery({
    queryKey: ['serviceCount', userId],
    queryFn: () => api.getServiceCountByUserId(userId),
  })

  const { data: successRate = 0 } = useQuery({
    queryKey: ['successRate', userId],
    queryFn: () => api.getServiceSuccessRateByUserId(userId),
  })

  const { data: todayCount = 0 } = useQuery({
    queryKey: ['todayCount', userId],
    queryFn: () => api.getServiceTodayCountByUserId(userId),
  })

  const { data: activeCount = 0 } = useQuery({
    queryKey: ['activeCount', userId],
    queryFn: () => api.getServiceActiveCountByUserId(userId),
  })

  const dashboardStats = {
    totalServices,
    successfulDeploymentsToday: 0, // API에서 제공하지 않으므로 0으로 설정
    failedDeploymentsToday: 0, // API에서 제공하지 않으므로 0으로 설정
    deploymentSuccessRate: successRate,
    activeEnvironments: activeCount,
    totalDeployments: todayCount,
  }

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
                {isLoading && (
                  <div className="col-span-2 flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">
                      {language === 'ko' ? '서비스를 불러오는 중...' : language === 'en' ? 'Loading services...' : 'サービスを読み込み中...'}
                    </span>
                  </div>
                )}
                {isError && (
                  <div className="col-span-2 flex items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-destructive mb-2">
                        {language === 'ko' ? '서비스를 불러오는데 실패했습니다.' : language === 'en' ? 'Failed to load services.' : 'サービスの読み込みに失敗しました。'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {error instanceof Error ? error.message : 'Unknown error'}
                      </p>
                    </div>
                  </div>
                )}
                {services && services.length > 0 && (
                  [...services]
                    .sort((a, b) => {
                      const dateA = a.created_date ? new Date(a.created_date).getTime() : 0;
                      const dateB = b.created_date ? new Date(b.created_date).getTime() : 0;
                      return dateB - dateA; // 오름차순 정렬
                    })
                    .map((service) => (
                      <EnvironmentCard
                        key={service.service_id}
                        serviceInfo={service}
                        onClick={() => setSelectedServiceId(service.service_id)}
                      />
                    ))
                )}
                {services && services.length === 0 && !isLoading && !isError && (
                  <div className="col-span-2 flex items-center justify-center py-12">
                    <p className="text-muted-foreground">
                      {language === 'ko' ? '등록된 서비스가 없습니다.' : language === 'en' ? 'No service found.' : '登録されたサービスがありません。'}
                    </p>
                  </div>
                )}
              </div>
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
            <DeploymentHistory serviceId={selectedServiceId} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
