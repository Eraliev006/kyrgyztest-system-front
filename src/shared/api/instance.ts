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
 * Orval custom mutator (httpClient: 'fetch'). Orval bakes query params into
 * `path` via its per-endpoint `getXUrl(params)` helpers, and — because a
 * custom mutator is configured — types every generated call site as
 * `Promise<{ data, status, headers }>`, not the bare body. The generated
 * code (e.g. reading `response.data`) depends on this exact shape, so this
 * must return the wrapper, not just the parsed JSON.
 * Only admin/examiner calls carry a JWT — /exam/** has no backend auth by
 * design (access-code flow only), so exam calls simply omit the header.
 */
export async function apiInstance<T extends { data: unknown; status: number; headers: Headers }>(
  path: string,
  options?: RequestInit,
): Promise<T> {
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
    // Most errors go through ErrorHandlingMiddleware as { statusCode, message },
    // but a few actions (e.g. ExamController's Login/Unlock) return NotFound("..."),
    // Unauthorized("..."), StatusCode(403, "...") directly — ASP.NET Core serializes
    // those as a bare JSON string, not an object.
    const message =
      typeof body === 'string'
        ? body
        : (body && typeof body === 'object' && 'message' in body && String(body.message)) ||
          response.statusText
    throw new ApiError(response.status, message, body)
  }

  return { data: body, status: response.status, headers: response.headers } as T
}
