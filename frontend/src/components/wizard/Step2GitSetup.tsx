import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Code2, Server, Layers } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

interface Step2Props {
  gitUrl: string;
  branch: string;
  domainPrefix: string;
  hasBackend: boolean;
  hasFrontend: boolean;
  backendStack: string;
  frontendStack: string;
  useRepoDockerfile: boolean;
  onGitUrlChange: (value: string) => void;
  onBranchChange: (value: string) => void;
  onDomainPrefixChange: (value: string) => void;
  onBackendToggle: () => void;
  onFrontendToggle: () => void;
  onBackendStackChange: (value: string) => void;
  onFrontendStackChange: (value: string) => void;
  onUseRepoDockerfileChange: (value: boolean) => void;
}

const Step2GitSetup = ({
  gitUrl,
  branch,
  domainPrefix,
  hasBackend,
  hasFrontend,
  backendStack,
  frontendStack,
  useRepoDockerfile,
  onGitUrlChange,
  onBranchChange,
  onDomainPrefixChange,
  onBackendToggle,
  onFrontendToggle,
  onBackendStackChange,
  onFrontendStackChange,
  onUseRepoDockerfileChange,
}: Step2Props) => {
  const { language } = useLanguage();
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="gitUrl">{t(language, 'gitRepository')} *</Label>
        <Input
          id="gitUrl"
          placeholder="https://github.com/username/repository"
          value={gitUrl}
          onChange={(e) => onGitUrlChange(e.target.value)}
          className="text-base"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="branch">{language === 'ko' ? '배포 브랜치' : language === 'en' ? 'Deploy Branch' : 'デプロイブランチ'} *</Label>
        <Select value={branch} onValueChange={onBranchChange}>
          <SelectTrigger>
            <SelectValue placeholder={language === 'ko' ? '브랜치 선택' : language === 'en' ? 'Select branch' : 'ブランチを選択'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">main</SelectItem>
            <SelectItem value="develop">develop</SelectItem>
            <SelectItem value="staging">staging</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="domainPrefix">{language === 'ko' ? '도메인 프리픽스' : language === 'en' ? 'Domain Prefix' : 'ドメインプレフィックス'} *</Label>
        <Input
          id="domainPrefix"
          placeholder={language === 'ko' ? '예: my-service' : language === 'en' ? 'Ex: my-service' : '例: my-service'}
          value={domainPrefix}
          onChange={(e) => onDomainPrefixChange(e.target.value.toLowerCase())}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          {language === 'ko'
            ? '서비스에 할당될 서브도메인 프리픽스입니다 (예: my-service.yoitang.com)'
            : language === 'en'
            ? 'Subdomain prefix for your service (e.g., my-service.yoitang.com)'
            : 'サービスに割り当てられるサブドメインプレフィックス (例: my-service.yoitang.com)'}
        </p>
      </div>

      <div className="space-y-3">
        <Label>{language === 'ko' ? '서비스 구성' : language === 'en' ? 'Service Configuration' : 'サービス構成'} *</Label>
        <div className="grid grid-cols-2 gap-3">
          <Card
            className={`p-4 cursor-pointer transition-all ${
              hasBackend
                ? 'border-primary bg-primary/5'
                : 'border-muted hover:border-muted-foreground/30'
            }`}
            onClick={onBackendToggle}
          >
            <div className="flex items-center gap-2 mb-2">
              <Server className={`h-5 w-5 ${hasBackend ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="font-medium">
                {language === 'ko' ? '백엔드' : language === 'en' ? 'Backend' : 'バックエンド'}
              </span>
              {hasBackend && <Badge variant="default" className="ml-auto">On</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'ko'
                ? 'API 서버 배포'
                : language === 'en'
                ? 'Deploy API server'
                : 'APIサーバーをデプロイ'}
            </p>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all ${
              hasFrontend
                ? 'border-primary bg-primary/5'
                : 'border-muted hover:border-muted-foreground/30'
            }`}
            onClick={onFrontendToggle}
          >
            <div className="flex items-center gap-2 mb-2">
              <Layers className={`h-5 w-5 ${hasFrontend ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="font-medium">
                {language === 'ko' ? '프론트엔드' : language === 'en' ? 'Frontend' : 'フロントエンド'}
              </span>
              {hasFrontend && <Badge variant="default" className="ml-auto">On</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'ko'
                ? 'UI 애플리케이션 배포'
                : language === 'en'
                ? 'Deploy UI application'
                : 'UIアプリケーションをデプロイ'}
            </p>
          </Card>
        </div>
        {/* Stack selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="mb-0">{language === 'ko' ? '고급 설정' : language === 'en' ? 'Advanced' : '詳細設定'}</Label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useRepoDockerfile}
                onChange={(e) => onUseRepoDockerfileChange(e.target.checked)}
              />
              <span className="text-xs text-muted-foreground">{language === 'ko' ? '레포의 Dockerfile 사용' : language === 'en' ? "Use repo's Dockerfile" : 'リポジトリのDockerfileを使用'}</span>
            </label>
          </div>

          {/* Backend Stack Options */}
          {hasBackend && (
            <div>
              <Label className="mb-2">{language === 'ko' ? '백엔드 스택 선택' : language === 'en' ? 'Backend Stack' : 'バックエンドスタック'}</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'spring', label: 'Spring Boot (Java 17 + Gradle)', enabled: true },
                  { id: 'django', label: 'Django (Python 3.11)', enabled: false },
                  { id: 'node-express', label: 'Node.js (Express)', enabled: true },
                  { id: 'fastapi', label: 'FastAPI', enabled: false },
                ].map((opt) => (
                  <Card
                    key={opt.id}
                    className={`p-3 cursor-pointer transition-all ${useRepoDockerfile ? 'opacity-50 pointer-events-none' : backendStack === opt.id ? 'border-primary bg-primary/5' : 'border-muted'}`}
                    onClick={() => !useRepoDockerfile && opt.enabled && onBackendStackChange(backendStack === opt.id ? '' : opt.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{opt.label}</div>
                      {!opt.enabled && <div className="text-xs text-muted-foreground">{language === 'ko' ? '미지원' : language === 'en' ? 'Unavailable' : '未対応'}</div>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Frontend Stack Options */}
          {hasFrontend && (
            <div>
              <Label className="mb-2">{language === 'ko' ? '프론트엔드 스택 선택' : language === 'en' ? 'Frontend Stack' : 'フロントエンドスタック'}</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'react', label: 'React (Vite/CRA)', enabled: true },
                  { id: 'next', label: 'Next.js', enabled: true },
                  { id: 'vue', label: 'Vue (Vite)', enabled: false },
                  { id: 'static', label: 'Static HTML (Nginx)', enabled: true },
                ].map((opt) => (
                  <Card
                    key={opt.id}
                    className={`p-3 cursor-pointer transition-all ${useRepoDockerfile ? 'opacity-50 pointer-events-none' : frontendStack === opt.id ? 'border-primary bg-primary/5' : 'border-muted'}`}
                    onClick={() => !useRepoDockerfile && opt.enabled && onFrontendStackChange(frontendStack === opt.id ? '' : opt.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{opt.label}</div>
                      {!opt.enabled && <div className="text-xs text-muted-foreground">{language === 'ko' ? '미지원' : language === 'en' ? 'Unavailable' : '未対応'}</div>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2GitSetup;
