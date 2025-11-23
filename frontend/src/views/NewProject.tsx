import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Rocket } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/lib/LanguageContext"
import { t } from "@/lib/i18n"
import StepIndicator from "@/components/wizard/StepIndicator"
import Step1BasicInfo from "@/components/wizard/Step1BasicInfo"
import Step2GitSetup from "@/components/wizard/Step2GitSetup"
import Step3Summary from "@/components/wizard/Step3Summary"
import api from "@/lib/api"

const NewProject = () => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const STEPS =
    language === 'ko'
      ? ['기본 정보', 'Git 설정', '요약 & 배포']
      : language === 'en'
        ? ['Basic Info', 'Git Setup', 'Summary & Deploy']
        : ['基本情報', 'Git設定', 'サマリーとデプロイ']

  const [currentStep, setCurrentStep] = useState(1)
  const [isDeploying, setIsDeploying] = useState(false)

  // Form state
  const [projectName, setProjectName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [gitUrl, setGitUrl] = useState('')
  const [branch, setBranch] = useState('main')
  const [domainPrefix, setDomainPrefix] = useState('')
  const [hasBackend, setHasBackend] = useState(true)
  const [hasFrontend, setHasFrontend] = useState(false)
  const [backendStack, setBackendStack] = useState('')
  const [frontendStack, setFrontendStack] = useState('')
  const [useRepoDockerfile, setUseRepoDockerfile] = useState(false)
  const [gitPat, setGitPat] = useState("");


  const validateStep = () => {
    if (currentStep === 1) {
      if (!projectName || !teamName) {
        toast.error(
          language === 'ko'
            ? '필수 항목을 입력해주세요'
            : language === 'en'
              ? 'Please enter required fields'
              : '必須項目を入力してください'
        )
        return false
      }
    }
    if (currentStep === 2) {
      if (!gitUrl || !branch || !domainPrefix) {
        toast.error(
          language === 'ko'
            ? 'Git 정보와 도메인을 입력해주세요'
            : language === 'en'
              ? 'Please enter Git information and domain'
              : 'Git情報とドメインを入力してください'
        )
        return false
      }
      if (!hasBackend && !hasFrontend) {
        toast.error(
          language === 'ko'
            ? '백엔드 또는 프론트엔드 중 하나를 선택해주세요'
            : language === 'en'
              ? 'Please select Backend or Frontend'
              : 'バックエンドまたはフロントエンドを選択してください'
        )
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleDeploy = async () => {
    setIsDeploying(true)
    toast.loading(
      language === 'ko'
        ? '배포를 시작합니다...'
        : language === 'en'
          ? 'Starting deployment...'
          : 'デプロイを開始します...',
      { id: 'deploy' }
    )

    try {
      // TODO: user_id를 실제 사용자 인증에서 가져오도록 수정 필요
      const userId = 1 // 임시로 하드코딩

      const result = await api.postAutoDeploy({
        user_id: userId,
        name: projectName,
        domain: domainPrefix,
        git_repo: gitUrl,
        git_branch: branch,
        git_pat: gitPat,
      })

      toast.success(
        language === 'ko'
          ? '배포가 시작되었습니다! 🎉'
          : language === 'en'
            ? 'Deployment started! 🎉'
            : 'デプロイが開始されました! 🎉',
        { id: 'deploy' }
      )
      navigate('/dashboard')
    } catch (error) {
      toast.error(
        language === 'ko'
          ? `배포 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
          : language === 'en'
            ? `Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            : `デプロイ失敗: ${error instanceof Error ? error.message : '不明なエラー'}`,
        { id: 'deploy' }
      )
    } finally {
      setIsDeploying(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            projectName={projectName}
            teamName={teamName}
            onProjectNameChange={setProjectName}
            onTeamNameChange={setTeamName}
          />
        )
      case 2:
        return (
          <Step2GitSetup
            gitUrl={gitUrl}
            branch={branch}
            domainPrefix={domainPrefix}
            hasBackend={hasBackend}
            hasFrontend={hasFrontend}
            backendStack={backendStack}
            frontendStack={frontendStack}
            useRepoDockerfile={useRepoDockerfile}
            onGitUrlChange={setGitUrl}
            onBranchChange={setBranch}
            onDomainPrefixChange={setDomainPrefix}
            onBackendToggle={() => setHasBackend(!hasBackend)}
            onFrontendToggle={() => setHasFrontend(!hasFrontend)}
            onBackendStackChange={setBackendStack}
            onFrontendStackChange={setFrontendStack}
            onUseRepoDockerfileChange={setUseRepoDockerfile}
            pat={gitPat}
            onPatChange={setGitPat}
          />
        )
      case 3:
        return (
          <Step3Summary
            projectName={projectName}
            teamName={teamName}
            gitUrl={gitUrl}
            branch={branch}
            domainPrefix={domainPrefix}
            hasBackend={hasBackend}
            hasFrontend={hasFrontend}
            backendStack={backendStack}
            frontendStack={frontendStack}
            useRepoDockerfile={useRepoDockerfile}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t(language, 'backToDashboard')}
        </Button>

        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{t(language, 'createNewService')}</h1>
            <p className="text-muted-foreground">
              {language === 'ko'
                ? '새로운 서비스를 생성하고 자동 배포를 시작합니다'
                : language === 'en'
                  ? 'Create a new service and start automatic deployment'
                  : '新しいサービスを作成し、自動デプロイを開始します'}
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator steps={STEPS} currentStep={currentStep} />

          {/* Content Card */}
          <Card>
            <CardContent className="p-8">{renderStep()}</CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === 'ko' ? '이전' : language === 'en' ? 'Previous' : '前へ'}
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-primary to-accent">
                {language === 'ko' ? '다음' : language === 'en' ? 'Next' : '次へ'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Rocket className="h-4 w-4 mr-2" />
                {isDeploying
                  ? language === 'ko'
                    ? '배포 중...'
                    : language === 'en'
                      ? 'Deploying...'
                      : 'デプロイ中...'
                  : t(language, 'deploy')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewProject
