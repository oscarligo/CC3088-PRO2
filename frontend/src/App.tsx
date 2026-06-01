import { useMemo, useState } from 'react'
import './App.css'
import { InventoryScreen } from './screens/InventoryScreen'
import { ProductsScreen } from './screens/ProductsScreen'
import { SuppliersScreen } from './screens/SuppliersScreen'
import { ReportsScreen } from './screens/ReportsScreen'

type TabKey = 'inventario' | 'productos' | 'proveedores' | 'reportes'

function App() {
  const apiBaseUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8081'
    return base.replace(/\/$/, '')
  }, [])

  const [tab, setTab] = useState<TabKey>('inventario')

  const navItems: Array<{ key: TabKey; label: string }> = [
    { key: 'inventario', label: 'Inventario' },
    { key: 'productos', label: 'Productos (CRUD completo)' },
    { key: 'proveedores', label: 'Proveedores (CRUD completo)' },
    { key: 'reportes', label: 'Reportes SQL' },
  ]

  return (
    <main className="page">
      <header className="pageHeader">
        <h1>Tienda — Inventario y Ventas</h1>
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
      </header>

      {tab === 'inventario' ? <InventoryScreen apiBaseUrl={apiBaseUrl} /> : null}
      {tab === 'productos' ? <ProductsScreen apiBaseUrl={apiBaseUrl} /> : null}
      {tab === 'proveedores' ? <SuppliersScreen apiBaseUrl={apiBaseUrl} /> : null}
      {tab === 'reportes' ? <ReportsScreen apiBaseUrl={apiBaseUrl} /> : null}
    </main>
  )
}

export default App
