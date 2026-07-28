import { useState } from 'react'
import { useGetApiOrganizations } from '@/shared/api/generated/organization/organization'
import type { Organization } from '@/entities/organization'
import { OrganizationForm } from '@/features/organization-crud/OrganizationForm'
import { DeleteOrganizationDialog } from '@/features/organization-crud/DeleteOrganizationDialog'
import { useDebouncedValue } from '@/shared/lib/use-debounced-value'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TableSkeletonRows } from '@/shared/ui/table-skeleton'

export default function OrganizationsPage() {
  const { data: response, isLoading } = useGetApiOrganizations()
  const allOrganizations = response?.data ?? []

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const query = debouncedSearch.trim().toLowerCase()
  const organizations = query
    ? allOrganizations.filter((org) =>
        [org.shortName, org.nameRu, org.nameKg].some((name) => name?.toLowerCase().includes(query)),
      )
    : allOrganizations

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Organization | undefined>(undefined)
  const [deleting, setDeleting] = useState<Organization | null>(null)

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(organization: Organization) {
    setEditing(organization)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Организации</h1>
        <Button onClick={openCreate} data-testid="organization-create-button">
          Добавить организацию
        </Button>
      </div>

      <Input
        placeholder="Поиск по названию организации..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
        data-testid="organizations-search"
      />

      <Table data-testid="organizations-table">
        <TableHeader>
          <TableRow>
            <TableHead>Краткое название</TableHead>
            <TableHead>Название (рус.)</TableHead>
            <TableHead>Название (кырг.)</TableHead>
            <TableHead className="w-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <TableSkeletonRows columns={4} />}
          {!isLoading && organizations.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>
                {query ? 'Ничего не найдено' : 'Организаций пока нет'}
              </TableCell>
            </TableRow>
          )}
          {organizations.map((org) => (
            <TableRow key={org.id} data-testid={`organization-row-${org.id}`}>
              <TableCell>{org.shortName}</TableCell>
              <TableCell>{org.nameRu}</TableCell>
              <TableCell>{org.nameKg}</TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(org)}
                  data-testid={`organization-row-${org.id}-edit`}
                >
                  Изменить
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleting(org)}
                  data-testid={`organization-row-${org.id}-delete`}
                >
                  Удалить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <OrganizationForm open={formOpen} onOpenChange={setFormOpen} organization={editing} />
      {deleting && (
        <DeleteOrganizationDialog
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          organization={deleting}
        />
      )}
    </div>
  )
}
