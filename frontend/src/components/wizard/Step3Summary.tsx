import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  GitBranch,
  Globe,
  Server,
  Layers,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface Step3Props {
  projectName: string;
  teamName: string;
  gitUrl: string;
  branch: string;
  domainPrefix: string;
  hasBackend: boolean;
  hasFrontend: boolean;
  backendStack?: string;
  frontendStack?: string;
  useRepoDockerfile?: boolean;
}

const Step3Summary = ({
  projectName,
  teamName,
  gitUrl,
  branch,
  domainPrefix,
  hasBackend,
  hasFrontend,
  backendStack,
  frontendStack,
  useRepoDockerfile,
}: Step3Props) => {
  const { language } = useLanguage();

  const repoName = gitUrl.split("/").slice(-2).join("/");

  return (
    <div className="space-y-6 animate-fade-in">
      <Alert className="border-primary/20 bg-primary/5">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <AlertDescription>
          {language === "ko"
            ? "배포 준비가 완료되었습니다. 아래 정보를 확인 후 배포를 시작하세요."
            : language === "en"
            ? "Your service is ready for deployment. Review the information below and start the deployment."
            : "デプロイの準備が完了しました。以下の情報を確認してからデプロイを開始してください。"}
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {language === "ko"
                ? "기본 정보"
                : language === "en"
                ? "Basic Information"
                : "基本情報"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {language === "ko"
                  ? "서비스명"
                  : language === "en"
                  ? "Service Name"
                  : "サービス名"}
              </span>
              <Badge variant="secondary">{projectName}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {language === "ko" ? "팀" : language === "en" ? "Team" : "チーム"}
              </span>
              <Badge variant="secondary">{teamName}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{language === 'ko' ? '스택 요약' : language === 'en' ? 'Stacks Summary' : 'スタック概要'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {useRepoDockerfile ? (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm">{language === 'ko' ? '레포의 Dockerfile을 사용하여 빌드합니다.' : language === 'en' ? "Will use repository's Dockerfile for build." : 'リポジトリのDockerfileを使用してビルドします。'}</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {hasBackend && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">{language === 'ko' ? '백엔드 스택' : language === 'en' ? 'Backend Stack' : 'バックエンドスタック'}</p>
                    <p className="text-sm font-mono">{backendStack || (language === 'ko' ? '선택 없음' : language === 'en' ? 'None' : '未選択')}</p>
                  </div>
                )}

                {hasFrontend && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">{language === 'ko' ? '프론트엔드 스택' : language === 'en' ? 'Frontend Stack' : 'フロントエンドスタック'}</p>
                    <p className="text-sm font-mono">{frontendStack || (language === 'ko' ? '선택 없음' : language === 'en' ? 'None' : '未選択')}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {language === "ko"
                ? "Git 저장소"
                : language === "en"
                ? "Git Repository"
                : "Gitリポジトリ"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <GitBranch className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Repository</p>
                <p className="text-sm font-mono truncate">{repoName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <GitBranch className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === "ko"
                    ? "배포 브랜치"
                    : language === "en"
                    ? "Deploy Branch"
                    : "デプロイブランチ"}
                </p>
                <p className="text-sm font-mono">{branch}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {language === "ko"
                ? "도메인 & 서비스"
                : language === "en"
                ? "Domain & Services"
                : "ドメイン & サービス"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Globe className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">
                  {language === "ko"
                    ? "도메인"
                    : language === "en"
                    ? "Domain"
                    : "ドメイン"}
                </p>
                <p className="text-sm font-mono">
                  {domainPrefix}.yoitang.com
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {hasBackend && (
                <div className="flex items-start gap-2 p-2 border border-primary/20 rounded-lg bg-primary/5">
                  <Server className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">
                      {language === "ko"
                        ? "백엔드"
                        : language === "en"
                        ? "Backend"
                        : "バックエンド"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "ko"
                        ? "API 배포"
                        : language === "en"
                        ? "API Deploy"
                        : "APIデプロイ"}
                    </p>
                  </div>
                </div>
              )}

              {hasFrontend && (
                <div className="flex items-start gap-2 p-2 border border-primary/20 rounded-lg bg-primary/5">
                  <Layers className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">
                      {language === "ko"
                        ? "프론트엔드"
                        : language === "en"
                        ? "Frontend"
                        : "フロントエンド"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "ko"
                        ? "UI 배포"
                        : language === "en"
                        ? "UI Deploy"
                        : "UIデプロイ"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {language === "ko"
              ? "AWS 리소스는 자동으로 프로비저닝됩니다. 배포 시작 후 몇 분 안에 서비스가 준비될 것입니다."
              : language === "en"
              ? "AWS resources will be automatically provisioned. Your service will be ready within a few minutes after deployment starts."
              : "AWSリソースは自動的にプロビジョニングされます。デプロイ開始後、数分以内にサービスが準備完了になります。"}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default Step3Summary;
