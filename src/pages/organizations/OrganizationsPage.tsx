import { useState } from 'react'
import { useGetApiOrganizations } from '@/shared/api/generated/organization/organization'
import type { Organization } from '@/entities/organization'
import { OrganizationForm } from '@/features/organization-crud/OrganizationForm'
import { DeleteOrganizationDialog } from '@/features/organization-crud/DeleteOrganizationDialog'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export default function OrganizationsPage() {
  const { data: response, isLoading } = useGetApiOrganizations()
  const organizations = response?.data ?? []

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
        <Button onClick={openCreate}>Добавить организацию</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Краткое название</TableHead>
            <TableHead>Название (рус.)</TableHead>
            <TableHead>Название (кырг.)</TableHead>
            <TableHead className="w-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={4}>Загрузка...</TableCell>
            </TableRow>
          )}
          {!isLoading && organizations.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>Организаций пока нет</TableCell>
            </TableRow>
          )}
          {organizations.map((org) => (
            <TableRow key={org.id}>
              <TableCell>{org.shortName}</TableCell>
              <TableCell>{org.nameRu}</TableCell>
              <TableCell>{org.nameKg}</TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => openEdit(org)}>
                  Изменить
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleting(org)}>
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
