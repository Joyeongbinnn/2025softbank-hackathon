import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Activity, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/LanguageContext"
import { t } from "@/lib/i18n"
import type { DashboardStats } from "@/types"

interface SummaryCardProps {
  stats: DashboardStats
}

const SummaryCard = ({ stats }: SummaryCardProps) => {
  const { language } = useLanguage()

  const summaryItems = [
    {
      key: 'totalServices',
      icon: Activity,
      value: stats.totalServices,
      label: t(language, 'totalServices'),
      color: 'from-primary/20 to-primary/10',
      iconColor: 'text-primary',
    },
    {
      key: 'successRate',
      icon: TrendingUp,
      value: `${stats.deploymentSuccessRate}%`,
      label: t(language, 'successRate'),
      color: 'from-success/20 to-success/10',
      iconColor: 'text-success',
    },
    {
      key: 'todaysDeployments',
      icon: Zap,
      value: stats.successfulDeploymentsToday + stats.failedDeploymentsToday,
      label: t(language, 'todaysDeployments'),
      color: 'from-accent/20 to-accent/10',
      iconColor: 'text-accent',
    },
    {
      key: 'activeEnvironments',
      icon: Activity,
      value: stats.activeEnvironments,
      label: t(language, 'activeEnvironments'),
      color: 'from-warning/20 to-warning/10',
      iconColor: 'text-warning',
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {summaryItems.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.key} className="transition-all hover:shadow-md">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    `rounded-lg bg-gradient-to-br ${item.color} w-12 h-12 flex items-center justify-center`
                  )}
                >
                  <Icon className={cn('h-6 w-6', item.iconColor)} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                <p className="text-3xl font-bold">{item.value}</p>
              </div>
              {item.key === 'successRate' && (
                <Badge variant="default" className="w-fit bg-success/20 text-success hover:bg-success/30">
                  ✓ {t(language, 'success')}
                </Badge>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default SummaryCard
