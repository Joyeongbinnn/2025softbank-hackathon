import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, GitBranch, Loader2, Archive } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface DeploymentHistoryProps {
  serviceId?: number | null;
}

const DeploymentHistory = ({ serviceId }: DeploymentHistoryProps) => {
  const { language } = useLanguage();
  
  const { data: deployments, isLoading, isError, error } = useQuery({
    queryKey: ['deployments', serviceId],
    queryFn: () => api.getDeploymentsByServiceId(serviceId!),
    enabled: !!serviceId, // serviceId가 있을 때만 요청
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t(language, 'deploymentHistory')}</CardTitle>
      </CardHeader>
      <CardContent>
        {!serviceId && (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">
              {language === 'ko' 
                ? '확인하고 싶은 서비스를 클릭하세요' 
                : language === 'en' 
                  ? 'Please click on a service to view its deployment history' 
                  : '確認したいサービスをクリックしてください'}
            </p>
          </div>
        )}
        {serviceId && isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              {language === 'ko' ? '배포 이력을 불러오는 중...' : language === 'en' ? 'Loading deployment history...' : 'デプロイ履歴を読み込み中...'}
            </span>
          </div>
        )}
        {serviceId && isError && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-sm text-destructive mb-1">
                {language === 'ko' ? '배포 이력을 불러오는데 실패했습니다.' : language === 'en' ? 'Failed to load deployment history.' : 'デプロイ履歴の読み込みに失敗しました。'}
              </p>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          </div>
        )}
        {serviceId && deployments && deployments.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">
              {language === 'ko' ? '배포 이력이 없습니다.' : language === 'en' ? 'No deployment history found.' : 'デプロイ履歴がありません。'}
            </p>
          </div>
        )}
        {serviceId && deployments && deployments.length > 0 && (
          <div className="space-y-4">
            {deployments.map((deployment, index) => (
              <div key={deployment.deploy_id} className="flex items-start gap-3 relative">
                {index < deployments.length - 1 && (
                  <div className="absolute left-[11px] top-8 w-0.5 h-12 bg-border" />
                )}
                
                <div className="flex-shrink-0 mt-1">
                  {deployment.status === 'SUCCESS' ? (
                    <div className="rounded-full bg-success/10 p-1">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                  ) : deployment.status === 'FAILED' ? (
                    <div className="rounded-full bg-destructive/10 p-1">
                      <XCircle className="h-4 w-4 text-destructive" />
                    </div>
                  ) : deployment.status === 'IN_PROGRESS' ? (
                    <div className="rounded-full bg-warning/10 p-1">
                      <Loader2 className="h-4 w-4 text-warning animate-spin" />
                    </div>
                  ) : deployment.status === 'ARCHIVED' ? (
                    <div className="rounded-full bg-muted p-1">
                      <Archive className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="rounded-full bg-muted p-1">
                      <Loader2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{new Date(deployment.created_date).toLocaleString()}</span>
                    <Badge variant="outline" className="text-xs">
                      <GitBranch className="h-3 w-3 mr-1" />
                      {deployment.git_branch}
                    </Badge>
                    <Badge
                      variant={
                        deployment.status === 'SUCCESS' 
                          ? 'default' 
                          : deployment.status === 'FAILED'
                          ? 'destructive'
                          : deployment.status === 'IN_PROGRESS'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="text-xs"
                    >
                      {deployment.status === 'SUCCESS' 
                        ? t(language, 'success') 
                        : deployment.status === 'FAILED'
                        ? t(language, 'failed')
                        : deployment.status === 'IN_PROGRESS'
                        ? (language === 'ko' ? '진행 중' : language === 'en' ? 'In Progress' : '進行中')
                        : deployment.status === 'ARCHIVED'
                        ? (language === 'ko' ? '아카이브됨' : language === 'en' ? 'Archived' : 'アーカイブ済み')
                        : (language === 'ko' ? '알 수 없음' : language === 'en' ? 'Unknown' : '不明')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {deployment.commit_message}
                  </p>
                  <code className="text-xs text-muted-foreground">
                    {deployment.commit_id}
                  </code>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeploymentHistory;
