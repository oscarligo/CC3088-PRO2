export type ApiErrorBody = {
  message?: string
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function getStoredToken(): string | undefined {
  try {
    const raw = localStorage.getItem('cc3088_session')
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as { token?: string }
    return parsed.token
  } catch {
    return undefined
  }
}

export async function apiJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const token = getStoredToken()
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (res.ok) {
    return (await res.json()) as T
  }

  let message = `HTTP ${res.status}`
  try {
    const maybeJson = (await res.json()) as ApiErrorBody
    if (maybeJson?.message) message = maybeJson.message
  } catch {
    try {
      const text = await res.text()
      if (text) message = text
    } catch {
      // ignore
    }
  }

  throw new ApiError(res.status, message)
}

export async function apiNoContent(url: string, init?: RequestInit): Promise<void> {
  const token = getStoredToken()
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (res.status === 204) return

  if (res.ok) {
    // tolerate endpoints that return 200 with empty body
    return
  }

  let message = `HTTP ${res.status}`
  try {
    const maybeJson = (await res.json()) as ApiErrorBody
    if (maybeJson?.message) message = maybeJson.message
  } catch {
    try {
      const text = await res.text()
      if (text) message = text
    } catch {
      // ignore
    }
  }

  throw new ApiError(res.status, message)
}
