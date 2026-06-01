import { useEffect, useState } from 'react'
import { apiJson } from '../api'

export type InventoryProduct = {
  id_product: number
  name: string
  unit_price: number | string
  stock: number
  id_category: string
  id_supplier: string
}

type Props = {
  apiBaseUrl: string
}

export function InventoryScreen({ apiBaseUrl }: Props) {
  const inventoryUrl = `${apiBaseUrl}/api/products/inventory`

  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await apiJson<InventoryProduct[]>(inventoryUrl, {
          signal: controller.signal,
        })
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
    <section className="section">
      <header className="sectionHeader">
        <h2>Inventario (VIEW)</h2>
        <p className="muted">
          Este listado se alimenta desde el backend usando el VIEW{' '}
          <code>vw_inventory</code>.
        </p>
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
                  <td>{p.name}</td>
                  <td className="mono">{typeof p.unit_price === 'string' ? parseFloat(p.unit_price).toFixed(2) : p.unit_price.toFixed(2)}</td>
                  <td className="mono">{p.stock}</td>
                  <td>{p.id_category}</td>
                  <td>{p.id_supplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
