import { Link, Navigate } from 'react-router-dom'
import {
  Activity,
  Building2,
  BookOpen,
  HelpCircle,
  Shuffle,
  Users,
  BarChart3,
  type LucideIcon,
} from 'lucide-react'
import { useGetApiResultsStats } from '@/shared/api/generated/results/results'
import {
  useGetApiCandidates,
  useGetApiCandidatesActiveAttempts,
} from '@/shared/api/generated/candidate/candidate'
import { useGetApiVariants } from '@/shared/api/generated/test-variant/test-variant'
import { useGetApiOrganizations } from '@/shared/api/generated/organization/organization'
import { useGetApiQuestions } from '@/shared/api/generated/question/question'
import { useGetApiTopics } from '@/shared/api/generated/topic/topic'
import { useAuth, UserRole } from '@/entities/account'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/shared/lib/utils'

const EPOCH = '2000-01-01'

interface StatCardProps {
  to: string
  icon: LucideIcon
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  loading?: boolean
  tone?: 'default' | 'critical'
}

function StatCard({
  to,
  icon: Icon,
  label,
  value,
  hint,
  loading,
  tone = 'default',
}: StatCardProps) {
  return (
    <Link
      to={to}
      className={cn(
        'block rounded-xl transition-colors hover:bg-muted/40',
        tone === 'critical' && 'ring-1 ring-destructive/40',
      )}
    >
      <Card size="sm">
        <CardContent className="flex items-start gap-3">
          <Icon
            className={cn(
              'mt-0.5 size-5 shrink-0',
              tone === 'critical' ? 'text-destructive' : 'text-muted-foreground',
            )}
          />
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{label}</span>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <span className="text-2xl font-semibold tabular-nums">{value}</span>
            )}
            {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

const canSeeVariants = (role: UserRole | undefined) =>
  role === UserRole.SuperAdmin || role === UserRole.Director
const canSeeTopics = (role: UserRole | undefined) =>
  role === UserRole.SuperAdmin || role === UserRole.Director || role === UserRole.Expert
const canSeeQuestions = (role: UserRole | undefined) =>
  role === UserRole.SuperAdmin || role === UserRole.Expert

export default function DashboardPage() {
  const { account } = useAuth()
  const role = account?.role
  const showVariants = canSeeVariants(role)
  const showTopics = canSeeTopics(role)
  const showQuestions = canSeeQuestions(role)

  const { data: statsResponse, isLoading: statsLoading } = useGetApiResultsStats()
  const stats = statsResponse?.data

  const { data: activeAttemptsResponse, isLoading: activeLoading } =
    useGetApiCandidatesActiveAttempts()
  const activeCount = activeAttemptsResponse?.data.length ?? 0

  const { data: variantsResponse, isLoading: variantsLoading } = useGetApiVariants(
    { includeArchived: true },
    { query: { enabled: showVariants } },
  )
  const variants = variantsResponse?.data ?? []
  const activeVariants = variants.filter((v) => !v.isArchived).length

  const { data: todayCandidatesResponse, isLoading: todayCandidatesLoading } = useGetApiCandidates({
    pageSize: 1,
  })
  const todayCandidates = todayCandidatesResponse?.data.totalCount ?? 0

  const { data: allCandidatesResponse, isLoading: allCandidatesLoading } = useGetApiCandidates({
    dateFrom: EPOCH,
    pageSize: 1,
  })
  const allCandidates = allCandidatesResponse?.data.totalCount ?? 0

  const { data: orgsResponse, isLoading: orgsLoading } = useGetApiOrganizations()
  const orgsCount = orgsResponse?.data.length ?? 0

  const { data: topicsResponse, isLoading: topicsLoading } = useGetApiTopics(undefined, {
    query: { enabled: showTopics },
  })
  const topicsCount = topicsResponse?.data.length ?? 0

  const { data: questionsResponse, isLoading: questionsLoading } = useGetApiQuestions(undefined, {
    query: { enabled: showQuestions },
  })
  const questionsCount = questionsResponse?.data.length ?? 0

  const byLevel = Object.entries(stats?.byLevel ?? {})

  if (role === UserRole.Expert || role === UserRole.Examiner) {
    return <Navigate to={role === UserRole.Examiner ? '/examiner' : '/admin/topics'} replace />
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Дашборд</h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          to="/admin/monitoring"
          icon={Activity}
          label="Сейчас на экзамене"
          value={activeCount}
          hint={activeCount === 0 ? 'Никто не проходит экзамен' : 'Перейти к мониторингу →'}
          loading={activeLoading}
        />
        {showVariants && (
          <StatCard
            to="/admin/variants"
            icon={Shuffle}
            label="Активных вариантов в пуле"
            value={`${activeVariants} / ${variants.length}`}
            hint={
              activeVariants === 0 ? 'Кандидаты не смогут начать экзамен!' : 'Перейти к вариантам →'
            }
            loading={variantsLoading}
            tone={activeVariants === 0 ? 'critical' : 'default'}
          />
        )}
        <StatCard
          to="/admin/candidates"
          icon={Users}
          label="Кандидатов сегодня"
          value={todayCandidatesLoading ? '—' : todayCandidates}
          hint={allCandidatesLoading ? undefined : `всего зарегистрировано: ${allCandidates}`}
          loading={todayCandidatesLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-4" />
            Результаты (за всё время)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Сдано экзаменов</span>
                <span className="text-2xl font-semibold tabular-nums">
                  {stats?.totalCount ?? 0}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Средний балл</span>
                <span className="text-2xl font-semibold tabular-nums">
                  {(stats?.averageScore ?? 0).toFixed(1)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">По уровням</span>
                <div className="flex flex-wrap gap-2">
                  {byLevel.length === 0 && <span className="text-sm text-muted-foreground">—</span>}
                  {byLevel.map(([level, count]) => (
                    <Badge key={level} variant="outline">
                      {level.toUpperCase()}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          to="/admin/organizations"
          icon={Building2}
          label="Организации"
          value={orgsCount}
          loading={orgsLoading}
        />
        {showTopics && (
          <StatCard
            to="/admin/topics"
            icon={BookOpen}
            label="Темы"
            value={topicsCount}
            loading={topicsLoading}
          />
        )}
        {showQuestions && (
          <StatCard
            to="/admin/questions"
            icon={HelpCircle}
            label="Вопросы"
            value={questionsCount}
            loading={questionsLoading}
          />
        )}
      </div>
    </div>
  )
}
