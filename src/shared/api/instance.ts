import { env } from '@/shared/config/env'
import { getAdminToken } from '@/shared/lib/token-storage'

export class ApiError extends Error {
  status: number
  body: unknown

  constructor(status: number, message: string, body: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

/**
 * Orval custom mutator (httpClient: 'fetch'). Orval already bakes query
 * params into `path` via its per-endpoint `getXUrl(params)` helpers, so this
 * only needs to resolve against the API base and attach the admin JWT.
 * Only admin/examiner calls carry a JWT — /exam/** has no backend auth by
 * design (access-code flow only), so exam calls simply omit the header.
 */
export async function apiInstance<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAdminToken()
  const url = new URL(path.replace(/^\//, ''), env.apiBaseUrl.replace(/\/?$/, '/'))

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  const contentType = response.headers.get('content-type')
  const body = contentType?.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null)

  if (!response.ok) {
    const message =
      (body && typeof body === 'object' && 'message' in body && String(body.message)) ||
      response.statusText
    throw new ApiError(response.status, message, body)
  }

  return body as T
}
