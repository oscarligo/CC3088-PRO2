export type AppRole = 'admin' | 'cajero' | 'inventario' | 'analista' | 'auditor'

export type Session = {
  token: string
  username: string
  role: AppRole
  expires_at: string
}

const SESSION_KEY = 'cc3088_session'

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function writeSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}