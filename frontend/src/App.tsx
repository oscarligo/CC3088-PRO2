import { useEffect, useMemo, useState, type FormEvent } from 'react'
import './App.css'
import { InventoryScreen } from './screens/InventoryScreen'
import { ProductsScreen } from './screens/ProductsScreen'
import { SuppliersScreen } from './screens/SuppliersScreen'
import { ReportsScreen } from './screens/ReportsScreen'
import { apiJson } from './api'
import { clearSession, readSession, type AppRole, type Session, writeSession } from './auth'

type TabKey = 'inventario' | 'productos' | 'proveedores' | 'reportes'

const ROLE_TABS: Record<AppRole, TabKey[]> = {
  admin: ['inventario', 'productos', 'proveedores', 'reportes'],
  inventario: ['inventario', 'productos', 'proveedores'],
  analista: ['inventario', 'reportes'],
  cajero: [],
  auditor: [],
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrador',
  cajero: 'Cajero',
  inventario: 'Inventario',
  analista: 'Analista',
  auditor: 'Auditor',
}

function App() {
  const apiBaseUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
    return base.replace(/\/$/, '')
  }, [])

  const [session, setSession] = useState<Session | null>(null)
  const [tab, setTab] = useState<TabKey>('inventario')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  useEffect(() => {
    setSession(readSession())
  }, [])

  const allNavItems = [
    { key: 'inventario', label: 'Inventario' },
    { key: 'productos', label: 'Productos' },
    { key: 'proveedores', label: 'Proveedores' },
    { key: 'reportes', label: 'Reportes' },
  ] as const satisfies ReadonlyArray<{ key: TabKey; label: string }>

  const navItems: Array<{ key: TabKey; label: string }> = session
    ? allNavItems.filter((item) => ROLE_TABS[session.role].includes(item.key))
    : []

  useEffect(() => {
    if (!session || navItems.length === 0) return
    if (!navItems.some((item) => item.key === tab)) {
      setTab(navItems[0].key)
    }
  }, [session, navItems, tab])

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setLoginError(null)
    setLoggingIn(true)

    try {
      const result = await apiJson<Session>(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      writeSession(result)
      setSession(result)
      setTab(ROLE_TABS[result.role][0] ?? 'inventario')
      setPassword('')
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    clearSession()
    setSession(null)
    setTab('inventario')
    setUsername('')
    setPassword('')
    setLoginError(null)
  }

  if (!session) {
    return (
      <main className="authShell">
        <section className="authCard">
          <div className="authHero">
            <p className="eyebrow">Sistema de tienda</p>
            <h1>Inicia sesión con el usuario de PostgreSQL</h1>
            <p className="muted">
              Los accesos salen de los usuarios definidos en <code>init.sql</code>. El backend valida las credenciales y activa las vistas según tu rol.
            </p>
          </div>

          <form className="authForm" onSubmit={handleLogin}>
            <label className="field">
              <span className="label">Usuario</span>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="user_master_admin"
                autoComplete="username"
                required
              />
            </label>

            <label className="field">
              <span className="label">Contraseña</span>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>

            {loginError ? (
              <p className="status error" role="alert">
                {loginError}
              </p>
            ) : null}

            <button className="button primary authButton" type="submit" disabled={loggingIn}>
              {loggingIn ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="page dashboard">
      <header className="pageHeader">
        <div className="titleRow">
          <div>
            <p className="eyebrow">Acceso activo</p>
            <h1>Tienda — Inventario y Ventas</h1>
          </div>
          <button className="button" type="button" onClick={handleLogout}>
            Salir
          </button>
        </div>

        <p className="muted">
          Sesión: <strong>{session.username}</strong> · Rol: <strong>{ROLE_LABELS[session.role]}</strong>
        </p>
        <p className="muted">API base: <code>{apiBaseUrl}</code></p>

        <nav className="tabs" aria-label="Secciones">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={tab === item.key ? 'tab active' : 'tab'}
              onClick={() => setTab(item.key)}
              aria-current={tab === item.key ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {navItems.length === 0 ? (
          <p className="status">Tu rol no tiene secciones visibles en esta interfaz.</p>
        ) : null}
      </header>

      {navItems.length > 0 ? (
        <>
          {tab === 'inventario' ? <InventoryScreen apiBaseUrl={apiBaseUrl} /> : null}
          {tab === 'productos' ? <ProductsScreen apiBaseUrl={apiBaseUrl} /> : null}
          {tab === 'proveedores' ? <SuppliersScreen apiBaseUrl={apiBaseUrl} /> : null}
          {tab === 'reportes' ? <ReportsScreen apiBaseUrl={apiBaseUrl} role={session.role} /> : null}
        </>
      ) : null}
    </main>
  )
}

export default App
