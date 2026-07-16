import { useState } from 'react'
import { useGetApiVariants } from '@/shared/api/generated/test-variant/test-variant'
import { useGetApiSectionConfig } from '@/shared/api/generated/section-config/section-config'
import { sectionLabels } from '@/shared/constants/section-labels'
import type { SectionConfig } from '@/entities/section'
import { VariantDetail } from '@/widgets/variant-builder/VariantDetail'
import { SectionConfigForm } from '@/features/section-config-crud/SectionConfigForm'
import { DeleteSectionConfigDialog } from '@/features/section-config-crud/DeleteSectionConfigDialog'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export default function VariantsPage() {
  const { data: variantsResponse, isLoading: variantsLoading } = useGetApiVariants()
  const variants = variantsResponse?.data ?? []
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  const { data: configsResponse, isLoading: configsLoading } = useGetApiSectionConfig()
  const configs = configsResponse?.data ?? []
  const [configFormOpen, setConfigFormOpen] = useState(false)
  const [editingConfig, setEditingConfig] = useState<SectionConfig | undefined>(undefined)
  const [deletingConfig, setDeletingConfig] = useState<SectionConfig | null>(null)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Сгенерированные варианты</h1>
        <p className="text-sm text-muted-foreground">
          Варианты собираются автоматически при старте попытки кандидата — здесь можно только
          просмотреть состав и заменить отдельный вопрос.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Номер</TableHead>
              <TableHead>Сгенерирован</TableHead>
              <TableHead>Вопросов</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {variantsLoading && (
              <TableRow>
                <TableCell colSpan={4}>Загрузка...</TableCell>
              </TableRow>
            )}
            {!variantsLoading && variants.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>Вариантов пока нет</TableCell>
              </TableRow>
            )}
            {variants.map((variant) => (
              <TableRow key={variant.id}>
                <TableCell>№{variant.number}</TableCell>
                <TableCell>{new Date(variant.generatedAt!).toLocaleString('ru-RU')}</TableCell>
                <TableCell>{variant.questionCount}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedVariantId(variant.id!)}
                  >
                    Открыть
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {selectedVariantId && <VariantDetail variantId={selectedVariantId} />}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Конфигурация разделов</h2>
          <Button
            onClick={() => {
              setEditingConfig(undefined)
              setConfigFormOpen(true)
            }}
          >
            Добавить конфигурацию
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Определяет, сколько вопросов каждого уровня попадает в раздел при генерации варианта.
        </p>
        <Table>
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
            {configsLoading && (
              <TableRow>
                <TableCell colSpan={7}>Загрузка...</TableCell>
              </TableRow>
            )}
            {!configsLoading && configs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>Конфигураций пока нет</TableCell>
              </TableRow>
            )}
            {configs.map((config) => (
              <TableRow key={config.id}>
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
                  >
                    Изменить
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeletingConfig(config)}>
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
