const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

function getAccessToken(): string | null {
  return localStorage.getItem('accessToken')
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth = false, ...init } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }

  if (!skipAuth) {
    const token = getAccessToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    if (res.status === 401 && !skipAuth) {
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    const body = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error((body as { error: string }).error ?? 'Request failed')
  }

  // 204 No Content
  if (res.status === 204) return undefined as T

  const json = await res.json()
  return json.data as T
}
