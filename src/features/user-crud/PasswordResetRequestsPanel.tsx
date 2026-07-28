import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import {
  useGetApiPasswordResetRequests,
  usePutApiPasswordResetRequestsIdApprove,
  usePutApiPasswordResetRequestsIdReject,
  getGetApiPasswordResetRequestsQueryKey,
} from '@/shared/api/generated/password-reset/password-reset'
import { UserRole } from '@/shared/api/generated/kyrgyzTestAPI.schemas'
import { useAuth } from '@/entities/account'
import { roleLabels } from '@/shared/constants/role-labels'
import { ApiError } from '@/shared/api/instance'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function PasswordResetRequestsPanel() {
  const { account } = useAuth()
  const queryClient = useQueryClient()
  const { data: response, isLoading } = useGetApiPasswordResetRequests({
    query: { refetchInterval: 15000 },
  })
  const requests = response?.data ?? []

  function onSettled() {
    queryClient.invalidateQueries({ queryKey: getGetApiPasswordResetRequestsQueryKey() })
  }

  const approveMutation = usePutApiPasswordResetRequestsIdApprove({
    mutation: {
      onSuccess: () => toast.success('Пароль обновлён'),
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  const rejectMutation = usePutApiPasswordResetRequestsIdReject({
    mutation: {
      onSuccess: () => toast.success('Заявка отклонена'),
      onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Ошибка'),
      onSettled,
    },
  })

  if (!isLoading && requests.length === 0) return null

  return (
    <Card data-testid="password-reset-requests-panel">
      <CardHeader>
        <CardTitle>Заявки на восстановление пароля</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ФИО</TableHead>
              <TableHead>Логин</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Подана</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const blocked =
                account?.role === UserRole.Director &&
                (request.userRole === UserRole.SuperAdmin || request.userRole === UserRole.Director)
              return (
                <TableRow key={request.id} data-testid={`password-reset-row-${request.id}`}>
                  <TableCell>{request.userFullName}</TableCell>
                  <TableCell className="font-mono text-sm">{request.userLogin}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{roleLabels[request.userRole!]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(request.requestedAt!).toLocaleString('ru-RU')}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      disabled={blocked || approveMutation.isPending || rejectMutation.isPending}
                      onClick={() => approveMutation.mutate({ id: request.id! })}
                      data-testid={`password-reset-row-${request.id}-approve`}
                    >
                      Одобрить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={blocked || approveMutation.isPending || rejectMutation.isPending}
                      onClick={() => rejectMutation.mutate({ id: request.id! })}
                      data-testid={`password-reset-row-${request.id}-reject`}
                    >
                      Отклонить
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
