import { useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  useGetApiVariants,
  usePostApiVariantsGenerate,
  getGetApiVariantsQueryKey,
} from '@/shared/api/generated/test-variant/test-variant'
import { useGetApiSectionConfig } from '@/shared/api/generated/section-config/section-config'
import { sectionLabels } from '@/shared/constants/section-labels'
import type { SectionConfig } from '@/entities/section'
import { ApiError } from '@/shared/api/instance'
import { VariantDetail } from '@/widgets/variant-builder/VariantDetail'
import { DeleteVariantDialog } from '@/features/variant-builder/DeleteVariantDialog'
import { SectionConfigForm } from '@/features/section-config-crud/SectionConfigForm'
import { DeleteSectionConfigDialog } from '@/features/section-config-crud/DeleteSectionConfigDialog'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TableSkeletonRows } from '@/shared/ui/table-skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'

export default function VariantsPage() {
  const queryClient = useQueryClient()
  const [showArchived, setShowArchived] = useState(false)
  const { data: variantsResponse, isLoading: variantsLoading } = useGetApiVariants({
    includeArchived: showArchived,
  })
  const variants = variantsResponse?.data ?? []
  const activeCount = variants.filter((v) => !v.isArchived).length
  const [selectedVariant, setSelectedVariant] = useState<{ id: string; number: number } | null>(
    null,
  )
  const [deletingVariant, setDeletingVariant] = useState<{ id: string; number: number } | null>(
    null,
  )

  const generateMutation = usePostApiVariantsGenerate({
    mutation: {
      onSuccess: (response) => {
        toast.success(`Вариант №${response.data.number} сгенерирован`)
        queryClient.invalidateQueries({ queryKey: getGetApiVariantsQueryKey() })
      },
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
    },
  })

  const { data: configsResponse, isLoading: configsLoading } = useGetApiSectionConfig()
  const configs = configsResponse?.data ?? []
  const [configFormOpen, setConfigFormOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<SectionConfig | undefined>(undefined)
  const [deletingConfig, setDeletingConfig] = useState<SectionConfig | null>(null)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Варианты</h1>
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            data-testid="variant-generate-button"
          >
            Сгенерировать вариант
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Пул готовых вариантов — при входе кандидату случайно достаётся один из активных ниже.
          Новые варианты появляются только по кнопке «Сгенерировать вариант», а не на каждый вход.
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Активных в пуле: {activeCount}</span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={() => setShowArchived((v) => !v)}
            data-testid="variants-toggle-archived"
          >
            {showArchived ? 'Скрыть архивные' : 'Показать архивные'}
          </Button>
        </div>
        <Table data-testid="variants-table">
          <TableHeader>
            <TableRow>
              <TableHead>Номер</TableHead>
              <TableHead>Сгенерирован</TableHead>
              <TableHead>Вопросов</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {variantsLoading && <TableSkeletonRows columns={5} />}
            {!variantsLoading && variants.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  Активных вариантов нет — сгенерируйте хотя бы один, иначе кандидаты не смогут
                  начать экзамен.
                </TableCell>
              </TableRow>
            )}
            {variants.map((variant) => (
              <TableRow key={variant.id} data-testid={`variant-row-${variant.id}`}>
                <TableCell>№{variant.number}</TableCell>
                <TableCell>{new Date(variant.generatedAt!).toLocaleString('ru-RU')}</TableCell>
                <TableCell>{variant.questionCount}</TableCell>
                <TableCell>
                  {variant.isArchived ? (
                    <Badge variant="outline">Архивный</Badge>
                  ) : (
                    <Badge variant="success">В пуле</Badge>
                  )}
                </TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVariant({ id: variant.id!, number: variant.number! })}
                    data-testid={`variant-row-${variant.id}-open`}
                  >
                    Открыть
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingVariant({ id: variant.id!, number: variant.number! })}
                    data-testid={`variant-row-${variant.id}-delete`}
                  >
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedVariant} onOpenChange={(open) => !open && setSelectedVariant(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Вариант №{selectedVariant?.number}</DialogTitle>
          </DialogHeader>
          {selectedVariant && <VariantDetail variantId={selectedVariant.id} />}
        </DialogContent>
      </Dialog>

      {deletingVariant && (
        <DeleteVariantDialog
          open={!!deletingVariant}
          onOpenChange={(open) => !open && setDeletingVariant(null)}
          variant={deletingVariant}
        />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Конфигурация разделов</h2>
          <Button
            onClick={() => {
              setEditingConfig(undefined)
              setConfigFormOpen(true)
            }}
            data-testid="section-config-create-button"
          >
            Добавить конфигурацию
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Определяет, сколько вопросов каждого уровня попадает в раздел при генерации варианта.
        </p>
        <Table data-testid="section-configs-table">
          <TableHeader>
            <TableRow>
              <TableHead>Раздел</TableHead>
              <TableHead>Лимит времени</TableHead>
              <TableHead>A1</TableHead>
              <TableHead>A2</TableHead>
              <TableHead>B1</TableHead>
              <TableHead>B2</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {configsLoading && <TableSkeletonRows columns={7} />}
            {!configsLoading && configs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>Конфигураций пока нет</TableCell>
              </TableRow>
            )}
            {configs.map((config) => (
              <TableRow key={config.id} data-testid={`section-config-row-${config.id}`}>
                <TableCell>{sectionLabels[config.section!]}</TableCell>
                <TableCell>{config.timeLimitMinutes} мин</TableCell>
                <TableCell>{config.a1Count}</TableCell>
                <TableCell>{config.a2Count}</TableCell>
                <TableCell>{config.b1Count}</TableCell>
                <TableCell>{config.b2Count}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingConfig(config)
                      setConfigFormOpen(true)
                    }}
                    data-testid={`section-config-row-${config.id}-edit`}
                  >
                    Изменить
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingConfig(config)}
                    data-testid={`section-config-row-${config.id}-delete`}
                  >
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SectionConfigForm
        open={configFormOpen}
        onOpenChange={setConfigFormOpen}
        config={editingConfig}
      />
      {deletingConfig && (
        <DeleteSectionConfigDialog
          open={!!deletingConfig}
          onOpenChange={(open) => !open && setDeletingConfig(null)}
          config={deletingConfig}
        />
      )}
    </div>
  )
}
