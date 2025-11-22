import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, AlertCircle } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { t } from "@/lib/i18n"

interface PATModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (pat: string) => void
}

const PATModal = ({ isOpen, onClose, onConfirm }: PATModalProps) => {
  const { language } = useLanguage()
  const [pat, setPat] = useState("")
  const [error, setError] = useState("")

  const handleConfirm = () => {
    if (!pat.trim()) {
      setError(
        language === "ko"
          ? "PAT를 입력해주세요"
          : language === "en"
            ? "Please enter a PAT"
            : "PAT を入力してください"
      )
      return
    }

    if (!pat.startsWith("ghp_")) {
      setError(
        language === "ko"
          ? "유효한 GitHub PAT를 입력해주세요 (ghp_ 로 시작)"
          : language === "en"
            ? "Please enter a valid GitHub PAT (starts with ghp_)"
            : "有効な GitHub PAT を入力してください (ghp_ で始まります)"
      )
      return
    }

    onConfirm(pat)
    setPat("")
    setError("")
  }

  const handleClose = () => {
    setPat("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t(language, "patModalTitle")}</DialogTitle>
          <DialogDescription>
            {t(language, "privateRepository")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {t(language, "patRequired")}
            </AlertDescription>
          </Alert>

          {/* Guide Section */}
          <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
            <h3 className="font-semibold text-sm">{t(language, "patGuideTitle")}</h3>
            <div className="space-y-2 text-sm">
              <p>{t(language, "patGuideStep1")}</p>
              <p>{t(language, "patGuideStep2")}</p>
              <p>{t(language, "patGuideStep3")}</p>
              <p>{t(language, "patGuideStep4")}</p>
              <p>{t(language, "patGuideStep5")}</p>
            </div>

            {/* GitHub Link Button */}
            <div className="mt-4 pt-3 border-t">
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t(language, "patGithubLink")}
                </Button>
              </a>
            </div>
          </div>

          {/* PAT Input Section */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="pat-input" className="text-sm font-medium">
                {t(language, "patGuideStep6")}
              </Label>
            </div>
            <div>
              <Input
                id="pat-input"
                type="password"
                placeholder={t(language, "patInputPlaceholder")}
                value={pat}
                onChange={(e) => {
                  setPat(e.target.value)
                  setError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirm()
                  }
                }}
                className="font-mono text-sm"
              />
              {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t(language, "cancel")}
          </Button>
          <Button onClick={handleConfirm}>
            {t(language, "patConfirmButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PATModal
