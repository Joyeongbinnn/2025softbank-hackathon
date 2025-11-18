import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Rocket, Zap, Users, Lock, ArrowRight, GitBranch } from "lucide-react"
import { useLanguage } from "@/lib/LanguageContext"
import { t } from "@/lib/i18n"

const Landing = () => {
  const { language } = useLanguage()

  const features = [
    {
      icon: Rocket,
      titleKey: 'oneclick_deploy',
      descKey: 'oneclick_desc',
      color: 'from-primary/20 to-primary/10',
      iconColor: 'text-primary',
    },
    {
      icon: Users,
      titleKey: 'ec2_setup',
      descKey: 'ec2_desc',
      color: 'from-accent/20 to-accent/10',
      iconColor: 'text-accent',
    },
    {
      icon: Zap,
      titleKey: 'https_setup',
      descKey: 'https_desc',
      color: 'from-success/20 to-success/10',
      iconColor: 'text-success',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary border border-primary/20">
            <GitBranch className="h-4 w-4" />
            {t(language, 'startup_platform')}
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight">
              {t(language, 'hero_title')}
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                {t(language, 'hero_title_accent')}
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t(language, 'hero_subtitle')}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-center justify-center pt-4">
            <Link to="/new-project">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg hover:shadow-xl transition-all">
                <Rocket className="mr-2 h-5 w-5" />
                {t(language, 'get_started')}
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {t(language, 'demo_view')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">
            {language === 'ko' ? '핵심 기능' : language === 'en' ? 'Key Features' : 'キー機能'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'ko' ? 'Yoitang Auto Deploy로 DevOps를 간단하게' : language === 'en' ? 'Simplify your DevOps with Yoitang Auto Deploy' : 'Yoitang Auto Deployでdevopsを簡素化'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.titleKey} className="border-2 transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden">
                <CardContent className="p-8 space-y-4">
                  <div className={`rounded-lg bg-gradient-to-br ${feature.color} w-14 h-14 flex items-center justify-center`}>
                    <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold">{t(language, feature.titleKey)}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t(language, feature.descKey)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Pipeline Flow Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">
            {language === 'ko' ? '자동 배포 파이프라인' : language === 'en' ? 'Automated Deployment Pipeline' : '自動デプロイメント・パイプライン'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'ko' ? 'Git 커밋부터 k3s 배포까지 모든 것이 자동화됩니다' : language === 'en' ? 'From Git commit to k3s deployment - fully automated' : 'Gitコミットからk3sデプロイまで完全自動化'}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-stretch">
            {[
              { step: 1, label: language === 'ko' ? 'Git URL' : language === 'en' ? 'Git URL' : 'Git URL' },
              { step: 2, label: language === 'ko' ? '빌드' : language === 'en' ? 'Build' : 'ビルド' },
              { step: 3, label: language === 'ko' ? 'Docker' : language === 'en' ? 'Docker' : 'Docker' },
              { step: 4, label: language === 'ko' ? 'k3s' : language === 'en' ? 'k3s' : 'k3s' },
              { step: 5, label: language === 'ko' ? 'HTTPS' : language === 'en' ? 'HTTPS' : 'HTTPS' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg p-4 text-center border border-primary/20 hover:border-primary/50 transition-colors">
                  <div className="text-2xl font-bold text-primary mb-2">{item.step}</div>
                  <div className="text-sm font-medium">{item.label}</div>
                </div>
                {idx < 4 && (
                  <div className="flex justify-center">
                    <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90 sm:rotate-0" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 sm:p-12 border border-primary/20 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">
            {language === 'ko' ? '지금 바로 시작하세요' : language === 'en' ? 'Ready to Get Started?' : '今すぐ始める'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'ko' ? 'Yoitang Auto Deploy와 함께 몇 분 만에 자동 배포를 시작하세요.' : language === 'en' ? 'Start your automated deployment journey in minutes with Yoitang Auto Deploy.' : 'Yoitang Auto Deployで数分で自動デプロイメントを開始'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/new-project">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg w-full sm:w-auto">
                <Rocket className="mr-2 h-5 w-5" />
                {t(language, 'createNewService')}
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {t(language, 'viewAllPipelines')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing
