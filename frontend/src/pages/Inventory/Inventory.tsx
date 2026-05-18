import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import { useAppConfig } from '../../context/AppConfigContext/useAppConfig'
import { getInventory } from '../../services/inventoryService'
import type { InventoryProduct } from '../../types/domain'
import './Inventory.css'

export default function Inventory() {
  const { apiBaseUrl } = useAppConfig()
  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getInventory(apiBaseUrl, controller.signal)
        setProducts(data)
      } catch (exception) {
        if (exception instanceof DOMException && exception.name === 'AbortError') return
        setError(exception instanceof Error ? exception.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    void load()

    return () => controller.abort()
  }, [apiBaseUrl])

  return (
    <section className="page inventoryPage pageFrame section">
      <PageHeader eyebrow="Vista" title="Inventario" description="Listado basado en el view del backend." />

      {loading ? (
        <StatusMessage kind="loading">Cargando productos...</StatusMessage>
      ) : error ? (
        <StatusMessage kind="error">Error: {error}</StatusMessage>
      ) : products.length === 0 ? (
        <StatusMessage kind="empty">No hay productos.</StatusMessage>
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
              {products.map((product) => (
                <tr key={product.id_product}>
                  <td className="mono">{product.id_product}</td>
                  <td>{product.product_name}</td>
                  <td className="mono">{product.unit_price.toFixed(2)}</td>
                  <td className="mono">{product.stock}</td>
                  <td>{product.category_name}</td>
                  <td>{product.supplier_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
