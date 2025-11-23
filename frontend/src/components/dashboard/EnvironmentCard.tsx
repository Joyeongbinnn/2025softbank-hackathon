import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, FileText, ExternalLink, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/lib/LanguageContext"
import { t } from "@/lib/i18n"
import { api } from "@/lib/api"
import { useState } from "react"
import type { Environment, ServiceInfo } from "@/types"

interface EnvironmentCardProps {
  serviceInfo: ServiceInfo
}

const EnvironmentCard = ({ serviceInfo }: EnvironmentCardProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  
  // const getStatusConfig = () => {
  //   switch (environment.status) {
  //     case 'success':
  //       return {
  //         icon: CheckCircle2,
  //         color: 'text-success',
  //         bgColor: 'bg-success/10',
  //         label: t(language, 'success'),
  //         badgeVariant: 'default' as const,
  //       };
  //     case 'deploying':
  //       return {
  //         icon: Loader2,
  //         color: 'text-warning',
  //         bgColor: 'bg-warning/10',
  //         label: t(language, 'running'),
  //         badgeVariant: 'secondary' as const,
  //       };
  //     case 'failed':
  //       return {
  //         icon: XCircle,
  //         color: 'text-destructive',
  //         bgColor: 'bg-destructive/10',
  //         label: t(language, 'failed'),
  //         badgeVariant: 'destructive' as const,
  //       };
  //     default:
  //       return {
  //         icon: CheckCircle2,
  //         color: 'text-muted-foreground',
  //         bgColor: 'bg-muted',
  //         label: language === 'ko' ? '대기' : language === 'en' ? 'Waiting' : '待機中',
  //         badgeVariant: 'outline' as const,
  //       };
  //   }
  // };
  
  // const statusConfig = getStatusConfig();
  // const StatusIcon = statusConfig.icon;
  
  const formatDate = (date?: Date) => {
    if (!date) return language === 'ko' ? 'N/A' : 'N/A'
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return language === 'ko' ? `${diffInMinutes}분 전` : language === 'en' ? `${diffInMinutes} minutes ago` : `${diffInMinutes}分前`
    }
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return language === 'ko' ? `${diffInHours}시간 전` : language === 'en' ? `${diffInHours} hours ago` : `${diffInHours}時間前`
    }
    return language === 'ko'
      ? `${Math.floor(diffInHours / 24)}일 전`
      : language === 'en'
        ? `${Math.floor(diffInHours / 24)} days ago`
        : `${Math.floor(diffInHours / 24)}日前`
  }

  return (
    <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* <div className={cn('rounded-lg p-2', statusConfig.bgColor)}>
              <StatusIcon
                className={cn(
                  'h-5 w-5',
                  statusConfig.color,
                  environment.status === 'deploying' && 'animate-spin'
                )}
              />
            </div> */}
            <div>
              <h3 className="font-bold text-lg">{serviceInfo.name}</h3>
              {/* <Badge variant={statusConfig.badgeVariant} className="mt-1">
                {statusConfig.label}
              </Badge> */}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t(language, 'lastDeployment')}</span>
            <span className="font-medium">{formatDate(new Date(serviceInfo.updated_date))}</span>
          </div>
          {/* {environment.commitHash && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t(language, 'commit')}</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{environment.commitHash}</code>
            </div>
          )} */}
          {/* {environment.commitMessage && (
            <div className="text-xs text-muted-foreground truncate">
              {environment.commitMessage}
            </div>
          )} */}
          {serviceInfo.domain && (
            <div className="text-xs text-muted-foreground truncate">
              Domain:{' '}
              <a
                href={serviceInfo.domain.startsWith('http') ? serviceInfo.domain : `https://${serviceInfo.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {serviceInfo.domain}
              </a>
            </div>
          )}
          {serviceInfo.git_repo && (
            <div className="text-xs text-muted-foreground truncate">
              Git Repository:{' '}
              <a
                href={serviceInfo.git_repo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {serviceInfo.git_repo}
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <RefreshCw className="h-3 w-3 mr-1" />
            {t(language, 'redeploy')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            disabled={isLoading}
            onClick={async () => {
              try {
                setIsLoading(true);
                const latestDeploy = await api.getLatestDeployByServiceId(serviceInfo.service_id);
                navigate(`/pipeline/${latestDeploy.deploy_id}`);
              } catch (error) {
                console.error('Failed to fetch latest deployment:', error);
                // 에러 발생 시에도 사용자에게 알림 (선택사항)
                alert(language === 'ko' 
                  ? '최신 배포 정보를 가져오는데 실패했습니다.' 
                  : language === 'en' 
                    ? 'Failed to fetch latest deployment information.'
                    : '最新のデプロイ情報の取得に失敗しました。');
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                {t(language, 'loading')}
              </>
            ) : (
              <>
                <FileText className="h-3 w-3 mr-1" />
                {t(language, 'viewLogs')}
              </>
            )}
          </Button>
          {/* <Button size="sm" variant="outline">
            <ExternalLink className="h-3 w-3" />
          </Button> */}
        </div>
      </CardContent>
    </Card>
  )
}

export default EnvironmentCard
