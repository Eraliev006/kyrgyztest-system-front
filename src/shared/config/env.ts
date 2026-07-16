const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is not configured. Set it in .env.local.')
}

export const env = {
  apiBaseUrl,
} as const
