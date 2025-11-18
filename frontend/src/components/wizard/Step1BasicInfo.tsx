import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/lib/LanguageContext"
import { t } from "@/lib/i18n"

interface Step1Props {
  projectName: string
  teamName: string
  onProjectNameChange: (value: string) => void
  onTeamNameChange: (value: string) => void
}

const Step1BasicInfo = ({
  projectName,
  teamName,
  onProjectNameChange,
  onTeamNameChange,
}: Step1Props) => {
  const { language } = useLanguage()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="projectName">{t(language, 'serviceName')} *</Label>
        <Input
          id="projectName"
          placeholder={
            language === 'ko'
              ? '예: 우리팀-백엔드-서비스'
              : language === 'en'
                ? 'Ex: Our-Team-Backend-Service'
                : '例: チーム-バックエンド-サービス'
          }
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          {language === 'ko'
            ? '서비스의 이름을 입력하세요'
            : language === 'en'
              ? 'Enter the name of your service'
              : 'サービスの名前を入力してください'}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="teamName">{t(language, 'currentTeam')} *</Label>
        <Input
          id="teamName"
          placeholder={
            language === 'ko'
              ? '예: 개발팀'
              : language === 'en'
                ? 'Ex: Dev Team'
                : '例: 開発チーム'
          }
          value={teamName}
          onChange={(e) => onTeamNameChange(e.target.value)}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          {language === 'ko'
            ? '서비스가 속할 팀 이름을 입력하세요'
            : language === 'en'
              ? 'Enter the team name for this service'
              : 'このサービスが属するチーム名を入力してください'}
        </p>
      </div>
    </div>
  )
}

export default Step1BasicInfo;
