import { useEffect, useMemo, useState } from 'react'
import './App.css'

type InventoryProduct = {
  id_product: number
  product_name: string
  unit_price: number
  stock: number
  category_name: string
  supplier_name: string
}

function App() {
  const apiBaseUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
    return base.replace(/\/$/, '')
  }, [])

  const inventoryUrl = useMemo(
    () => `${apiBaseUrl}/api/products/inventory`,
    [apiBaseUrl],
  )

  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(inventoryUrl, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data = (await res.json()) as InventoryProduct[]
        setProducts(data)
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return
        const message = e instanceof Error ? e.message : 'Error desconocido'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void load()

    return () => controller.abort()
  }, [inventoryUrl])

  return (
    <main className="page">
      <header className="pageHeader">
        <h1>Inventario</h1>
        <p className="muted">Mostrando productos desde el backend.</p>
        <p className="muted">
          API: <code>{inventoryUrl}</code>
        </p>
      </header>

      {loading ? (
        <p className="status">Cargando productos...</p>
      ) : error ? (
        <p className="status error" role="alert">
          Error: {error}
        </p>
      ) : products.length === 0 ? (
        <p className="status">No hay productos.</p>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id_product}>
                  <td className="mono">{p.id_product}</td>
                  <td>{p.product_name}</td>
                  <td className="mono">{p.unit_price.toFixed(2)}</td>
                  <td className="mono">{p.stock}</td>
                  <td>{p.category_name}</td>
                  <td>{p.supplier_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

export default App
