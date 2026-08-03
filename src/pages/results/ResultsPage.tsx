import { useState, type FormEvent } from 'react'
import { getApiCandidatesSearch } from '@/shared/api/generated/candidate/candidate'
import {
  useGetApiResultsCandidateId,
  useGetApiResults,
} from '@/shared/api/generated/results/results'
import { useGetApiOrganizations } from '@/shared/api/generated/organization/organization'
import {
  SectionType,
  type CandidateResponseDto,
} from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { languageLevelLabels } from '@/shared/constants/question-labels'
import { sectionLabels } from '@/shared/constants/section-labels'
import { ApiError } from '@/shared/api/instance'
import { Button } from '@/shared/ui/button'
import { DatePicker } from '@/shared/ui/date-picker'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TableSkeletonRows } from '@/shared/ui/table-skeleton'

const sectionFields = [
  { key: 'grammarScore', label: sectionLabels[SectionType.Grammar] },
  { key: 'listeningScore', label: sectionLabels[SectionType.Listening] },
  { key: 'readingScore', label: sectionLabels[SectionType.Reading] },
  { key: 'writingScore', label: sectionLabels[SectionType.Writing] },
  { key: 'speakingScore', label: sectionLabels[SectionType.Speaking] },
] as const

const ALL_ORGANIZATIONS = 'all'

interface AppliedFilters {
  organizationId?: string
  dateFrom?: string
  dateTo?: string
}

function isNumeric(value: string) {
  return /^\d+$/.test(value)
}

function formatDate(value: string | undefined) {
  return value ? new Date(value).toLocaleString('ru-RU') : '—'
}

export default function ResultsPage() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [candidate, setCandidate] = useState<CandidateResponseDto | null>(null)

  const {
    data: resultResponse,
    isLoading: resultLoading,
    isError: resultNotFound,
  } = useGetApiResultsCandidateId(candidate?.id ?? '', {
    query: { enabled: !!candidate?.id, retry: false },
  })
  const result = resultResponse?.data

  const { data: orgsResponse } = useGetApiOrganizations()
  const organizations = orgsResponse?.data ?? []

  const [filterOrgId, setFilterOrgId] = useState(ALL_ORGANIZATIONS)
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters | null>(null)

  const { data: listResponse, isLoading: listLoading } = useGetApiResults(
    {
      organizationId: appliedFilters?.organizationId,
      dateFrom: appliedFilters?.dateFrom,
      dateTo: appliedFilters?.dateTo,
    },
    { query: { enabled: !!appliedFilters } },
  )
  const listResults = listResponse?.data ?? []

  const filtersSelected = filterOrgId !== ALL_ORGANIZATIONS || !!filterDateFrom || !!filterDateTo

  function applyFilters(e: FormEvent) {
    e.preventDefault()
    if (!filtersSelected) return
    setAppliedFilters({
      organizationId: filterOrgId === ALL_ORGANIZATIONS ? undefined : filterOrgId,
      dateFrom: filterDateFrom || undefined,
      dateTo: filterDateTo || undefined,
    })
  }

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    setIsSearching(true)
    setSearchError(null)
    setCandidate(null)
    try {
      const params = isNumeric(trimmed) ? { inn: trimmed } : { code: trimmed }
      const response = await getApiCandidatesSearch(params)
      setCandidate(response.data as CandidateResponseDto)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setSearchError('Кандидат с таким ИНН или логином не найден')
      } else {
        setSearchError(error instanceof ApiError ? error.message : 'Ошибка поиска')
      }
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Результаты</h1>
        <p className="text-sm text-muted-foreground">
          Результат виден только по прямому запросу — найдите конкретного кандидата или задайте
          фильтр по организации и/или дате.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-2">
        <Label htmlFor="results-search">ИНН или логин кандидата</Label>
        <div className="flex max-w-sm gap-2">
          <Input
            id="results-search"
            placeholder="Например, 12345678901234 или AB1234"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="results-search-input"
          />
          <Button
            type="submit"
            disabled={isSearching || !query.trim()}
            data-testid="results-search-button"
          >
            {isSearching ? 'Поиск...' : 'Найти'}
          </Button>
        </div>
      </form>

      {searchError && (
        <p className="text-sm text-destructive" data-testid="results-search-error">
          {searchError}
        </p>
      )}

      {candidate && (
        <Card data-testid="results-candidate-card">
          <CardHeader>
            <CardTitle>{candidate.fullName}</CardTitle>
            <CardDescription>
              ИНН: {candidate.inn} · Логин: {candidate.accessCode}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {resultLoading && (
              <p className="text-sm text-muted-foreground">Загрузка результата...</p>
            )}

            {!resultLoading && resultNotFound && (
              <p className="text-sm text-muted-foreground" data-testid="results-no-result">
                У кандидата ещё нет результата — экзамен не завершён.
              </p>
            )}

            {!resultLoading && result && (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="success">{languageLevelLabels[result.level!]}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Начал: {formatDate(result.startedAt)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Завершил: {formatDate(result.createdAt)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {sectionFields.map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex flex-col gap-1 rounded-lg border border-border p-3"
                      data-testid={`results-section-${key}`}
                    >
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-lg font-semibold tabular-nums">{result[key]}</span>
                    </div>
                  ))}
                  <div className="flex flex-col gap-1 rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <span className="text-xs text-muted-foreground">Итого</span>
                    <span className="text-lg font-semibold tabular-nums">{result.totalScore}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <div>
          <h2 className="text-lg font-semibold">Список по фильтру</h2>
          <p className="text-sm text-muted-foreground">
            Выберите организацию и/или диапазон дат — хотя бы один фильтр обязателен.
          </p>
        </div>

        <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Организация</Label>
            <Select
              items={{
                [ALL_ORGANIZATIONS]: 'Все организации',
                ...Object.fromEntries(organizations.map((org) => [org.id!, org.shortName!])),
              }}
              value={filterOrgId}
              onValueChange={(value) => setFilterOrgId(value as string)}
            >
              <SelectTrigger className="w-56" data-testid="results-filter-org-trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ORGANIZATIONS}>Все организации</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id!}>
                    {org.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="results-filter-date-from">Дата с</Label>
            <DatePicker
              id="results-filter-date-from"
              value={filterDateFrom}
              onChange={setFilterDateFrom}
              data-testid="results-filter-date-from"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="results-filter-date-to">Дата по</Label>
            <DatePicker
              id="results-filter-date-to"
              value={filterDateTo}
              onChange={setFilterDateTo}
              data-testid="results-filter-date-to"
            />
          </div>
          <Button type="submit" disabled={!filtersSelected} data-testid="results-filter-apply">
            Показать
          </Button>
        </form>

        {appliedFilters && (
          <Table data-testid="results-filtered-table">
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                <TableHead>ИНН</TableHead>
                <TableHead>Организация</TableHead>
                <TableHead>Уровень</TableHead>
                <TableHead>Итого</TableHead>
                <TableHead>Дата экзамена</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listLoading && <TableSkeletonRows columns={6} />}
              {!listLoading && listResults.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>Ничего не найдено по этому фильтру</TableCell>
                </TableRow>
              )}
              {listResults.map((r) => (
                <TableRow key={r.id} data-testid={`results-filtered-row-${r.id}`}>
                  <TableCell>{r.candidateFullName}</TableCell>
                  <TableCell className="font-mono text-sm">{r.candidateInn}</TableCell>
                  <TableCell>{r.organizationShortName ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant="success">{languageLevelLabels[r.level!]}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">{r.totalScore}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
