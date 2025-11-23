import { useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ArrowLeft, Cpu, DollarSign, Database, Rocket } from "lucide-react"

import { getNamespaceCostSummary, getNamespaceResourceUsage } from "@/api/metrics"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api"
import { useLanguage } from "@/lib/LanguageContext"
import { t } from "@/lib/i18n"

const bytesToGb = (value?: number) => {
  if (!value) return 0
  return value / 1024 / 1024 / 1024
}

const ensureMs = (ts?: number) => {
  if (!ts) return 0
  return ts < 1_000_000_000_000 ? ts * 1000 : ts
}

const formatDurationSeconds = (start?: string, end?: string) => {
  if (!start) return 0
  const startMs = new Date(start).getTime()
  const endMs = end ? new Date(end).getTime() : startMs
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return 0
  return Math.max(0, Math.round((endMs - startMs) / 1000))
}

const getLocale = (language: string) => {
  if (language === "en") return "en-US"
  if (language === "ja") return "ja-JP"
  return "ko-KR"
}

const MetricsDashboard = () => {
  const { language } = useLanguage()
  const [searchParams] = useSearchParams()
  const prefix = searchParams.get("prefix") ?? undefined
  const namespace = searchParams.get("namespace") ?? ""
  const serviceIdParam = searchParams.get("serviceId")
  const serviceId = serviceIdParam ? Number(serviceIdParam) : undefined
  const hasServiceId = typeof serviceId === "number" && !Number.isNaN(serviceId)
  const locale = getLocale(language)

  const resourceUsageQuery = useQuery({
    queryKey: ["metrics-resource-usage", namespace],
    queryFn: () => getNamespaceResourceUsage(namespace),
    enabled: Boolean(namespace),
    staleTime: 60_000,
  })

  const costSummaryQuery = useQuery({
    queryKey: ["metrics-cost-summary", namespace],
    queryFn: () => getNamespaceCostSummary(namespace),
    enabled: Boolean(namespace),
    staleTime: 60_000,
  })

  const deploymentsQuery = useQuery({
    queryKey: ["service-deployments", serviceId],
    queryFn: () => api.getDeploymentsByServiceId(serviceId!),
    enabled: hasServiceId,
    staleTime: 30_000,
  })

  const resourceUsage = resourceUsageQuery.data
  const costSummary = costSummaryQuery.data
  const deploymentRows = useMemo(() => {
    if (!deploymentsQuery.data?.length) return []
    return [...deploymentsQuery.data].sort(
      (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime(),
    )
  }, [deploymentsQuery.data])

  const latestCpu = resourceUsage?.cpu?.at(-1)?.cores ?? 0
  const latestMemoryBytes = resourceUsage?.memory?.at(-1)?.bytes ?? 0
  const latestDeploy = deploymentRows[0]

  const summaryCards = useMemo(() => {
    const missingServiceText =
      language === "ko" ? "서비스 ID 필요" : language === "ja" ? "サービスIDが必要" : "Service ID required"
    return [
      {
        title:
          language === "ko"
            ? "오늘 예상 비용"
            : language === "ja"
              ? "本日の推定コスト"
              : "Today's Estimated Cost",
        value: costSummary ? `$${costSummary.today.toFixed(2)} / day` : "—",
        subtext: costSummary ? costSummary.currency : "",
        icon: DollarSign,
      },
      {
        title: language === "ko" ? "CPU 사용량" : language === "ja" ? "CPU使用量" : "CPU Usage",
        value: resourceUsage ? `${latestCpu.toFixed(3)} cores` : "—",
        subtext: resourceUsage
          ? `${(resourceUsage.efficiency.cpu * 100).toFixed(0)}% efficiency`
          : "",
        icon: Cpu,
      },
      {
        title: language === "ko" ? "메모리 사용량" : language === "ja" ? "メモリ使用量" : "Memory Usage",
        value: resourceUsage ? `${bytesToGb(latestMemoryBytes).toFixed(2)} GB` : "—",
        subtext: resourceUsage
          ? `${(resourceUsage.efficiency.memory * 100).toFixed(0)}% efficiency`
          : "",
        icon: Database,
      },
      {
        title:
          language === "ko" ? "마지막 배포" : language === "ja" ? "最新デプロイ" : "Last Deployment",
        value: hasServiceId
          ? latestDeploy
            ? `${(latestDeploy.status || "unknown").toUpperCase()} · ${formatDurationSeconds(latestDeploy.created_date, latestDeploy.updated_date)}s · #${latestDeploy.deploy_id}`
            : language === "ko"
              ? "데이터 없음"
              : language === "ja"
                ? "データなし"
                : "No data"
          : missingServiceText,
        subtext:
          hasServiceId && latestDeploy
            ? new Date(latestDeploy.created_date).toLocaleString(locale, {
              timeZone: "Asia/Seoul",
            })
            : "",
        icon: Rocket,
      },
    ]
  }, [costSummary, resourceUsage, latestDeploy, hasServiceId, language, locale, latestCpu, latestMemoryBytes])

  const deployChartData = useMemo(() => {
    if (!deploymentRows.length) return []
    return deploymentRows
      .map((deploy) => ({
        number: `#${deploy.deploy_id}`,
        durationSec: formatDurationSeconds(deploy.created_date, deploy.updated_date),
        result: deploy.status,
        timestamp: new Date(deploy.created_date).getTime(),
      }))
      .reverse()
  }, [deploymentRows])

  const clusterSeriesData = useMemo(() => {
    const merged = new Map<number, { ts: number; cpu?: number; memGb?: number }>()
    resourceUsage?.cpu?.forEach((point) => {
      const ts = ensureMs(point.timestamp)
      const existing = merged.get(ts) ?? { ts }
      existing.cpu = point.cores
      merged.set(ts, existing)
    })
    resourceUsage?.memory?.forEach((point) => {
      const ts = ensureMs(point.timestamp)
      const existing = merged.get(ts) ?? { ts }
      existing.memGb = bytesToGb(point.bytes)
      merged.set(ts, existing)
    })
    return Array.from(merged.values())
      .sort((a, b) => a.ts - b.ts)
      .map((entry) => ({
        ...entry,
        label: new Date(entry.ts).toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Seoul",
        }),
      }))
  }, [resourceUsage, locale])

  const costChartData = useMemo(() => {
    if (!costSummary) return []
    const labels =
      language === "ko"
        ? ["오늘", "최근 7일", "이번 달"]
        : language === "ja"
          ? ["今日", "過去7日", "今月"]
          : ["Today", "Last 7d", "Month to date"]
    return [
      { label: labels[0], cost: costSummary.today },
      { label: labels[1], cost: costSummary.last7d },
      { label: labels[2], cost: costSummary.monthToDate },
    ]
  }, [costSummary, language])

  const formatKst = (value?: number) => {
    if (!value) {
      return language === "ko" ? "정보 없음" : language === "ja" ? "情報なし" : "N/A"
    }
    return new Date(value).toLocaleString(locale, { timeZone: "Asia/Seoul" })
  }

  const loadingText =
    language === "ko"
      ? "메트릭을 불러오는 중..."
      : language === "ja"
        ? "メトリクスを読み込み中..."
        : "Loading metrics..."

  const noDataText =
    language === "ko" ? "데이터가 없습니다." : language === "ja" ? "データがありません。" : "No data."

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" className="px-2" asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t(language, "backToDashboard")}
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              {prefix && <Badge variant="secondary">{prefix}</Badge>}
              {namespace && <Badge variant="outline">{namespace}</Badge>}
            </div>
            <h1 className="text-3xl font-bold">
              {language === "ko"
                ? "메트릭 대시보드"
                : language === "ja"
                  ? "メトリクスダッシュボード"
                  : "Metrics Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {language === "ko"
                ? "선택한 환경의 리소스와 배포 현황을 한눈에 확인하세요."
                : language === "ja"
                  ? "選択した環境のリソースとデプロイ状況を一目で確認できます。"
                  : "Inspect resource and deployment health for the selected environment."}
            </p>
          </div>
        </div>

        {!namespace && (
          <Alert variant="destructive">
            <AlertTitle>
              {language === "ko"
                ? "namespace 파라미터가 필요합니다"
                : language === "ja"
                  ? "namespace パラメータが必要です"
                  : "Namespace parameter is required"}
            </AlertTitle>
            <AlertDescription>
              {language === "ko"
                ? "서비스 카드의 Metrics 버튼을 통해 다시 접속해주세요."
                : language === "ja"
                  ? "サービスカードの Metrics ボタンから開いてください。"
                  : "Please open this page through the Metrics button on a service card."}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card, idx) => (
            <Card key={card.title + idx}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.subtext && <p className="text-xs text-muted-foreground mt-1">{card.subtext}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="space-y-0">
            <CardHeader>
              <CardTitle>
                {language === "ko"
                  ? "최근 배포 추세"
                  : language === "ja"
                    ? "最近のデプロイトレンド"
                    : "Recent Deploy Trend"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!hasServiceId ? (
                <p className="text-sm text-muted-foreground">
                  {language === "ko"
                    ? "서비스 ID가 없어서 배포 이력을 조회할 수 없습니다."
                    : language === "ja"
                      ? "サービスIDがないためデプロイ履歴を取得できません。"
                      : "Cannot load deployment history without a service ID."}
                </p>
              ) : deploymentsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">{loadingText}</p>
              ) : deploymentsQuery.isError ? (
                <p className="text-sm text-destructive">{(deploymentsQuery.error as Error).message}</p>
              ) : deployChartData.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deployChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="number" />
                      <YAxis />
                      <RechartsTooltip
                        formatter={(value, _name, props) => {
                          const timestamp = props.payload?.timestamp
                          return [`${value}s`, formatKst(timestamp)]
                        }}
                        labelFormatter={() =>
                          language === "ko"
                            ? "빌드 지속 시간"
                            : language === "ja"
                              ? "ビルド時間"
                              : "Build Duration"
                        }
                      />
                      <Bar
                        dataKey="durationSec"
                        fill="#16a34a"
                        stroke="#16a34a"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={false}
                      >
                        {deployChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.number}-${index}`}
                            fill={entry.result === "success" ? "#16a34a" : "#dc2626"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{noDataText}</p>
              )}

              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>{language === "ko" ? "결과" : language === "ja" ? "結果" : "Result"}</TableHead>
                      <TableHead>
                        {language === "ko" ? "소요 시간(s)" : language === "ja" ? "時間(s)" : "Duration(s)"}
                      </TableHead>
                      <TableHead>
                        {language === "ko" ? "시간 (KST)" : language === "ja" ? "時刻 (KST)" : "Time (KST)"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deploymentRows.length ? (
                      deploymentRows.map((build) => (
                        <TableRow key={build.deploy_id}>
                          <TableCell className="font-semibold">#{build.deploy_id}</TableCell>
                          <TableCell>
                            <Badge
                              variant={build.status === "success" ? "secondary" : "destructive"}
                              className={
                                build.status === "success"
                                  ? "bg-success/20 text-success border-0"
                                  : undefined
                              }
                            >
                              {(build.status || "unknown").toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDurationSeconds(build.created_date, build.updated_date)}</TableCell>
                          <TableCell>{formatKst(new Date(build.created_date).getTime())}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          {noDataText}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {language === "ko"
                  ? "CPU / 메모리 추세 (1h)"
                  : language === "ja"
                    ? "CPU / メモリ推移 (1時間)"
                    : "CPU / Memory Trend (1h)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resourceUsageQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">{loadingText}</p>
              ) : resourceUsageQuery.isError ? (
                <p className="text-sm text-destructive">{(resourceUsageQuery.error as Error).message}</p>
              ) : clusterSeriesData.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={clusterSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis yAxisId="left" stroke="#2563eb" />
                      <YAxis yAxisId="right" orientation="right" stroke="#db2777" />
                      <RechartsTooltip />
                      <Line
                        type="monotone"
                        dataKey="cpu"
                        stroke="#2563eb"
                        dot={false}
                        name="CPU (cores)"
                        yAxisId="left"
                      />
                      <Line
                        type="monotone"
                        dataKey="memGb"
                        stroke="#db2777"
                        dot={false}
                        name="Memory (GB)"
                        yAxisId="right"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{noDataText}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {language === "ko"
                ? "일간 비용 추이 (7d)"
                : language === "ja"
                  ? "日次コスト推移 (7日間)"
                  : "Daily Cost Trend (7d)"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {costSummaryQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">{loadingText}</p>
            ) : costSummaryQuery.isError ? (
              <p className="text-sm text-destructive">{(costSummaryQuery.error as Error).message}</p>
            ) : costChartData.length ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={costChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="cost" stroke="#10b981" dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{noDataText}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MetricsDashboard

