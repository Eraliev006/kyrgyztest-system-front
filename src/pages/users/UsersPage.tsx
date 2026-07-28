import { useState } from 'react'
import { useGetApiUser } from '@/shared/api/generated/user/user'
import type { StaffUser } from '@/entities/user'
import { roleLabels } from '@/shared/constants/role-labels'
import { UserForm } from '@/features/user-crud/UserForm'
import { DeleteUserDialog } from '@/features/user-crud/DeleteUserDialog'
import { PasswordResetRequestsPanel } from '@/features/user-crud/PasswordResetRequestsPanel'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { TableSkeletonRows } from '@/shared/ui/table-skeleton'

export default function UsersPage() {
  const { data: response, isLoading } = useGetApiUser()
  const users = response?.data ?? []

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<StaffUser | undefined>(undefined)
  const [deleting, setDeleting] = useState<StaffUser | null>(null)

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(user: StaffUser) {
    setEditing(user)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Сотрудники</h1>
        <Button onClick={openCreate} data-testid="user-create-button">
          Добавить сотрудника
        </Button>
      </div>

      <PasswordResetRequestsPanel />

      <Table data-testid="users-table">
        <TableHeader>
          <TableRow>
            <TableHead>ФИО</TableHead>
            <TableHead>Логин</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Создан</TableHead>
            <TableHead className="w-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && <TableSkeletonRows columns={5} />}
          {!isLoading && users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>Сотрудников пока нет</TableCell>
            </TableRow>
          )}
          {users.map((user) => (
            <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
              <TableCell>{user.fullName}</TableCell>
              <TableCell className="font-mono text-sm">{user.login}</TableCell>
              <TableCell>
                <Badge variant="outline">{roleLabels[user.role!]}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(user.createdAt!).toLocaleDateString('ru-RU')}
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(user)}
                  data-testid={`user-row-${user.id}-edit`}
                >
                  Изменить
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleting(user)}
                  data-testid={`user-row-${user.id}-delete`}
                >
                  Удалить
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <UserForm open={formOpen} onOpenChange={setFormOpen} user={editing} />
      {deleting && (
        <DeleteUserDialog
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          user={deleting}
        />
      )}
    </div>
  )
}
