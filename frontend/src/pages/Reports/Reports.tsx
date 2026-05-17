import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAppConfig } from '../../context/AppConfigContext/useAppConfig'
import { createSale, getReportData } from '../../services/reportsService'
import type {
  CategorySales,
  Client,
  CreateSaleResponse,
  Employee,
  InventoryProduct,
  Product,
  SaleLine,
  SupplierProductCount,
  TopClient,
} from '../../types/domain'

export default function Reports() {
  const { apiBaseUrl } = useAppConfig()

  const urls = useMemo(
    () => ({
      saleLines: `${apiBaseUrl}/api/reports/sale-lines`,
      supplierProductCount: `${apiBaseUrl}/api/reports/supplier-product-count?min_products=1`,
      categorySales: `${apiBaseUrl}/api/reports/category-sales?min_total=0`,
      unsoldProducts: `${apiBaseUrl}/api/reports/unsold-products`,
      clientsMinSales: `${apiBaseUrl}/api/reports/clients-min-sales?min_sales=2`,
      topClients: `${apiBaseUrl}/api/reports/top-clients?limit=10`,
      sales: `${apiBaseUrl}/api/sales`,
    }),
    [apiBaseUrl],
  )

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saleLines, setSaleLines] = useState<SaleLine[]>([])
  const [supplierCounts, setSupplierCounts] = useState<SupplierProductCount[]>([])
  const [categorySales, setCategorySales] = useState<CategorySales[]>([])
  const [unsoldProducts, setUnsoldProducts] = useState<InventoryProduct[]>([])
  const [clientsMinSales, setClientsMinSales] = useState<Client[]>([])
  const [topClients, setTopClients] = useState<TopClient[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [saleSaving, setSaleSaving] = useState(false)
  const [saleError, setSaleError] = useState<string | null>(null)
  const [saleSuccess, setSaleSuccess] = useState<string | null>(null)
  const [idClient, setIdClient] = useState<string>('')
  const [idEmployee, setIdEmployee] = useState<string>('')
  const [idProduct, setIdProduct] = useState<string>('')
  const [amount, setAmount] = useState<string>('1')

  const loadAll = async (signal?: AbortSignal) => {
    const data = await getReportData(apiBaseUrl, signal)

    setSaleLines(data.saleLines)
    setSupplierCounts(data.supplierProductCount)
    setCategorySales(data.categorySales)
    setUnsoldProducts(data.unsoldProducts)
    setClientsMinSales(data.clientsMinSales)
    setTopClients(data.topClients)
    setClients(data.clients)
    setEmployees(data.employees)
    setProducts(data.products)

    if (!idClient && data.clients.length > 0) setIdClient(String(data.clients[0].id_client))
    if (!idEmployee && data.employees.length > 0) setIdEmployee(String(data.employees[0].id_employee))
    if (!idProduct && data.products.length > 0) setIdProduct(String(data.products[0].id_product))
  }

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        await loadAll(controller.signal)
      } catch (exception) {
        if (exception instanceof DOMException && exception.name === 'AbortError') return
        setError(exception instanceof Error ? exception.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    void load()

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl])

  const reload = async () => {
    setError(null)
    setLoading(true)

    try {
      await loadAll()
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const submitSale = async (event: FormEvent) => {
    event.preventDefault()
    setSaleError(null)
    setSaleSuccess(null)

    const idEmployeeNumber = Number(idEmployee)
    const idProductNumber = Number(idProduct)
    const amountNumber = Number(amount)

    if (!Number.isInteger(idEmployeeNumber) || idEmployeeNumber <= 0) {
      setSaleError('Selecciona un empleado válido')
      return
    }

    if (!Number.isInteger(idProductNumber) || idProductNumber <= 0) {
      setSaleError('Selecciona un producto válido')
      return
    }

    if (!Number.isInteger(amountNumber) || amountNumber <= 0) {
      setSaleError('La cantidad debe ser un entero > 0')
      return
    }

    const idClientNumber = Number(idClient)
    const idClientPayload = Number.isInteger(idClientNumber) && idClientNumber > 0 ? idClientNumber : null

    setSaleSaving(true)

    try {
      const response: CreateSaleResponse = await createSale(apiBaseUrl, {
        id_client: idClientPayload,
        id_employee: idEmployeeNumber,
        items: [{ id_product: idProductNumber, amount: amountNumber }],
      })

      setSaleSuccess(`Venta creada con id_sale=${response.id_sale}`)
      await reload()
    } catch (exception) {
      setSaleError(exception instanceof Error ? exception.message : 'Error desconocido')
    } finally {
      setSaleSaving(false)
    }
  }

  return (
    <section className="page pageFrame section">
      <header className="pageHeader">
        <span className="eyebrow">Analítica</span>
        <h2>Reportes</h2>
        <p className="muted">Consultas de SQL y registro de ventas coordinados desde servicios reutilizables.</p>
        <div className="buttonRow">
          <button className="button" type="button" onClick={() => void reload()} disabled={loading}>
            Recargar
          </button>
        </div>
      </header>

      {loading ? <p className="status">Cargando reportes...</p> : null}
      {error ? (
        <p className="status error" role="alert">
          Error: {error}
        </p>
      ) : null}

      <div className="gridTwo">
        <div className="panel">
          <h3>JOIN: Detalle de ventas</h3>
          <p className="muted">API: <code>{urls.saleLines}</code></p>
          {saleLines.length === 0 ? (
            <p className="status">Sin datos.</p>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Venta</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Empleado</th>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th>Total línea</th>
                  </tr>
                </thead>
                <tbody>
                  {saleLines.map((line, index) => (
                    <tr key={`${line.id_sale}-${index}`}>
                      <td className="mono">{line.id_sale}</td>
                      <td className="mono">{line.sale_date}</td>
                      <td>{line.client_name ?? '-'}</td>
                      <td>{line.employee_name}</td>
                      <td>{line.product_name}</td>
                      <td className="mono">{line.amount}</td>
                      <td className="mono">{line.sale_price.toFixed(2)}</td>
                      <td className="mono">{line.line_total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <h3>JOIN + GROUP BY: Productos por proveedor</h3>
          <p className="muted">API: <code>{urls.supplierProductCount}</code></p>
          {supplierCounts.length === 0 ? (
            <p className="status">Sin datos.</p>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th># Productos</th>
                    <th>Precio promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierCounts.map((row) => (
                    <tr key={row.id_supplier}>
                      <td>{row.supplier_name}</td>
                      <td className="mono">{row.products_count}</td>
                      <td className="mono">{row.avg_unit_price == null ? '-' : row.avg_unit_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <h3>GROUP BY: Ventas por categoría</h3>
          <p className="muted">API: <code>{urls.categorySales}</code></p>
          {categorySales.length === 0 ? (
            <p className="status">Sin datos.</p>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Items vendidos</th>
                    <th># Ventas</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {categorySales.map((row) => (
                    <tr key={row.id_category}>
                      <td>{row.category_name}</td>
                      <td className="mono">{row.items_sold}</td>
                      <td className="mono">{row.sales_count}</td>
                      <td className="mono">{row.total_revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <h3>SUBQUERY: Productos sin ventas</h3>
          <p className="muted">API: <code>{urls.unsoldProducts}</code></p>
          {unsoldProducts.length === 0 ? (
            <p className="status">Sin datos (todos tienen ventas).</p>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Stock</th>
                    <th>Categoría</th>
                    <th>Proveedor</th>
                  </tr>
                </thead>
                <tbody>
                  {unsoldProducts.map((product) => (
                    <tr key={product.id_product}>
                      <td className="mono">{product.id_product}</td>
                      <td>{product.product_name}</td>
                      <td className="mono">{product.stock}</td>
                      <td>{product.category_name}</td>
                      <td>{product.supplier_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <h3>SUBQUERY: Clientes con al menos 2 ventas</h3>
          <p className="muted">API: <code>{urls.clientsMinSales}</code></p>
          {clientsMinSales.length === 0 ? (
            <p className="status">Sin datos.</p>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>NIT</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {clientsMinSales.map((client) => (
                    <tr key={client.id_client}>
                      <td className="mono">{client.id_client}</td>
                      <td>{client.name}</td>
                      <td className="mono">{client.nit ?? '-'}</td>
                      <td className="mono">{client.email ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <h3>CTE: Top clientes por gasto</h3>
          <p className="muted">API: <code>{urls.topClients}</code></p>
          {topClients.length === 0 ? (
            <p className="status">Sin datos.</p>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th># Ventas</th>
                    <th>Total gastado</th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map((client) => (
                    <tr key={client.id_client}>
                      <td className="mono">{client.id_client}</td>
                      <td>{client.client_name}</td>
                      <td className="mono">{client.sales_count}</td>
                      <td className="mono">{client.total_spent.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <h3>Transacción: Registrar venta</h3>
        <p className="muted">
          Si envías una cantidad mayor al stock, el backend hace <code>ROLLBACK</code> y verás el error.
        </p>
        <p className="muted">API: <code>{urls.sales}</code></p>

        {saleSuccess ? <p className="status">{saleSuccess}</p> : null}
        {saleError ? (
          <p className="status error" role="alert">
            {saleError}
          </p>
        ) : null}

        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault()
            void submitSale(event)
          }}
        >
          <div className="formRow">
            <label className="field">
              <span className="label">Cliente</span>
              <select className="select" value={idClient} onChange={(event) => setIdClient(event.target.value)} disabled={saleSaving || clients.length === 0}>
                {clients.map((client) => (
                  <option key={client.id_client} value={client.id_client}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">Empleado</span>
              <select className="select" value={idEmployee} onChange={(event) => setIdEmployee(event.target.value)} disabled={saleSaving || employees.length === 0}>
                {employees.map((employee) => (
                  <option key={employee.id_employee} value={employee.id_employee}>
                    {employee.name} — {employee.role}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">Producto</span>
              <select className="select" value={idProduct} onChange={(event) => setIdProduct(event.target.value)} disabled={saleSaving || products.length === 0}>
                {products.map((product) => (
                  <option key={product.id_product} value={product.id_product}>
                    {product.name} (stock: {product.stock})
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">Cantidad</span>
              <input className="input" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="numeric" disabled={saleSaving} />
            </label>
          </div>

          <div className="buttonRow">
            <button className="button primary" type="submit" disabled={saleSaving}>
              {saleSaving ? 'Guardando...' : 'Registrar venta'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
