import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { apiJson } from '../api'
import type { AppRole } from '../auth'

type SaleLine = {
  id_sale: number
  sale_date: string
  client_name: string | null
  employee_name: string
  product_name: string
  amount: number
  sale_price: number | string
  line_total:  number | string
}

type SupplierProductCount = {
  id_supplier: number
  supplier_name: string
  products_count: number
  avg_unit_price: number | string | null 
}

type CategorySales = {
  id_category: number
  category_name: string
  items_sold: number
  sales_count: number
  total_revenue: number | string
}

type InventoryProduct = {
  id_product: number
  product_name: string
  unit_price: number | string
  stock: number
  id_category: number
  category_name: string
  id_supplier: number
  supplier_name: string
}

type Client = {
  id_client: number
  name: string
  nit: string | null
  email: string | null
}

type TopClient = {
  id_client: number
  client_name: string
  total_spent: number | string
  sales_count: number
}

type Employee = {
  id_employee: number
  name: string
  role: string
}

type Product = {
  id_product: number
  name: string
  unit_price: number | string
  stock: number
  id_category: number | string
  id_supplier: number | string
}

type CreateSaleResponse = {
  sale: {
    id_sale: number
  }
}

type Props = {
  apiBaseUrl: string
  role: AppRole
}

export function ReportsScreen({ apiBaseUrl, role }: Props) {
  const urls = useMemo(
    () => ({
      saleLines: `${apiBaseUrl}/api/reports/sale-lines`,
      supplierProductCount: `${apiBaseUrl}/api/reports/supplier-product-count?min_products=1`,
      categorySales: `${apiBaseUrl}/api/reports/category-sales?min_total=0`,
      unsoldProducts: `${apiBaseUrl}/api/reports/unsold-products`,
      clientsMinSales: `${apiBaseUrl}/api/reports/clients-min-sales?min_sales=2`,
      topClients: `${apiBaseUrl}/api/reports/top-clients?limit=10`,
      clients: `${apiBaseUrl}/api/clients`,
      employees: `${apiBaseUrl}/api/employees`,
      products: `${apiBaseUrl}/api/products`,
      sales: `${apiBaseUrl}/api/sales`,
    }),
    [apiBaseUrl],
  )

  const canCreateSales = role === 'admin' || role === 'cajero'

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

  const setDefaultsForSaleForm = (opts: {
    clients: Client[]
    employees: Employee[]
    products: Product[]
  }) => {
    if (!idClient && opts.clients.length > 0) setIdClient(String(opts.clients[0].id_client))
    if (!idEmployee && opts.employees.length > 0) setIdEmployee(String(opts.employees[0].id_employee))
    if (!idProduct && opts.products.length > 0) setIdProduct(String(opts.products[0].id_product))
  }

  const loadAll = async (signal?: AbortSignal) => {
    const [
      saleLinesData,
      supplierCountsData,
      categorySalesData,
      unsoldProductsData,
      clientsMinSalesData,
      topClientsData,
      clientsData,
      employeesData,
      productsData,
    ] = await Promise.all([
      apiJson<SaleLine[]>(urls.saleLines, { signal }),
      apiJson<SupplierProductCount[]>(urls.supplierProductCount, { signal }),
      apiJson<CategorySales[]>(urls.categorySales, { signal }),
      apiJson<InventoryProduct[]>(urls.unsoldProducts, { signal }),
      apiJson<Client[]>(urls.clientsMinSales, { signal }),
      apiJson<TopClient[]>(urls.topClients, { signal }),
      canCreateSales ? apiJson<Client[]>(urls.clients, { signal }) : Promise.resolve([] as Client[]),
      canCreateSales ? apiJson<Employee[]>(urls.employees, { signal }) : Promise.resolve([] as Employee[]),
      canCreateSales ? apiJson<Product[]>(urls.products, { signal }) : Promise.resolve([] as Product[]),
    ])

    setSaleLines(saleLinesData)
    setSupplierCounts(supplierCountsData)
    setCategorySales(categorySalesData)
    setUnsoldProducts(unsoldProductsData)
    setClientsMinSales(clientsMinSalesData)
    setTopClients(topClientsData)

    if (canCreateSales) {
      setClients(clientsData)
      setEmployees(employeesData)
      setProducts(productsData)

      setDefaultsForSaleForm({
        clients: clientsData,
        employees: employeesData,
        products: productsData,
      })
    } else {
      setClients([])
      setEmployees([])
      setProducts([])
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        await loadAll(controller.signal)
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    void load()

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls, canCreateSales])

  const reload = async () => {
    setError(null)
    setLoading(true)

    try {
      await loadAll()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const submitSale = async (e: FormEvent) => {
    e.preventDefault()
    if (!canCreateSales) return
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
      const res = await apiJson<CreateSaleResponse>(urls.sales, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_client: idClientPayload,
          id_employee: idEmployeeNumber,
          details: [{ id_product: idProductNumber, amount: amountNumber, price_at_sale: Number(products.find((p) => p.id_product === idProductNumber)?.unit_price ?? 0) }],
        }),
      })

      setSaleSuccess(`Venta creada con id_sale=${res.sale.id_sale}`)
      await reload()
    } catch (e) {
      setSaleError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setSaleSaving(false)
    }
  }

  return (
    <section className="section">
      <header className="sectionHeader">
        <h2>Reportes SQL</h2>
        <p className="muted">
          Estas consultas se ejecutan desde la aplicación web (backend) y sus resultados se muestran aquí.
        </p>
        <div className="buttonRow">
          <button className="button" type="button" onClick={reload} disabled={loading}>
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

      <div className="reportGrid">
        <div className="reportCard">
          <h3 className="cardTitle">Detalle de ventas</h3>
          <p className="muted">
            API: <code>{urls.saleLines}</code>
          </p>
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
                  {saleLines.map((r, idx) => (
                    <tr key={`${r.id_sale}-${idx}`}>
                      <td className="mono">{r.id_sale}</td>
                      <td className="mono">{r.sale_date}</td>
                      <td>{r.client_name ?? '-'}</td>
                      <td>{r.employee_name}</td>
                      <td>{r.product_name}</td>
                      <td className="mono">{r.amount}</td>
                      <td className="mono">{Number(r.sale_price).toFixed(2)}</td>
                      <td className="mono">{Number(r.line_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="reportCard">
          <h3 className="cardTitle">Productos por proveedor</h3>
          <p className="muted">
            API: <code>{urls.supplierProductCount}</code>
          </p>
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
                  {supplierCounts.map((r) => (
                    <tr key={r.id_supplier}>
                      <td>{r.supplier_name}</td>
                      <td className="mono">{r.products_count}</td>
                      <td className="mono">
                        {r.avg_unit_price == null ? '-' : Number(r.avg_unit_price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="reportCard">
          <h3 className="cardTitle">Ventas por categoría</h3>
          <p className="muted">
            API: <code>{urls.categorySales}</code>
          </p>
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
                  {categorySales.map((r) => (
                    <tr key={r.id_category}>
                      <td>{r.category_name}</td>
                      <td className="mono">{r.items_sold}</td>
                      <td className="mono">{r.sales_count}</td>
                      <td className="mono">{Number(r.total_revenue).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="reportCard">
          <h3 className="cardTitle">Productos sin ventas</h3>
          <p className="muted">
            API: <code>{urls.unsoldProducts}</code>
          </p>
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
                  {unsoldProducts.map((p) => (
                    <tr key={p.id_product}>
                      <td className="mono">{p.id_product}</td>
                      <td>{p.product_name}</td>
                      <td className="mono">{p.stock}</td>
                      <td>{p.category_name}</td>
                      <td>{p.supplier_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="reportCard">
          <h3 className="cardTitle">Clientes con al menos 2 ventas</h3>
          <p className="muted">
            API: <code>{urls.clientsMinSales}</code>
          </p>
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
                  {clientsMinSales.map((c) => (
                    <tr key={c.id_client}>
                      <td className="mono">{c.id_client}</td>
                      <td>{c.name}</td>
                      <td className="mono">{c.nit ?? '-'}</td>
                      <td className="mono">{c.email ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="reportCard">
          <h3 className="cardTitle">Top clientes por gasto</h3>
          <p className="muted">
            API: <code>{urls.topClients}</code>
          </p>
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
                  {topClients.map((c) => (
                    <tr key={c.id_client}>
                      <td className="mono">{c.id_client}</td>
                      <td>{c.client_name}</td>
                      <td className="mono">{c.sales_count}</td>
                      <td className="mono">{Number(c.total_spent).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="reportCard full">
        <h3 className="cardTitle">Registrar venta</h3>
        <p className="muted">
          API: <code>{urls.sales}</code>
        </p>

        {canCreateSales ? (
          <>
            {saleSuccess ? <p className="status">{saleSuccess}</p> : null}
            {saleError ? (
              <p className="status error" role="alert">
                {saleError}
              </p>
            ) : null}

            <form className="form" onSubmit={submitSale}>
              <div className="formRow">
                <label className="field">
                  <span className="label">Cliente</span>
                  <select
                    className="select"
                    value={idClient}
                    onChange={(e) => setIdClient(e.target.value)}
                    disabled={saleSaving || clients.length === 0}
                  >
                    <option value="">Sin cliente</option>
                    {clients.map((c) => (
                      <option key={c.id_client} value={c.id_client}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="label">Empleado</span>
                  <select
                    className="select"
                    value={idEmployee}
                    onChange={(e) => setIdEmployee(e.target.value)}
                    disabled={saleSaving || employees.length === 0}
                  >
                    {employees.map((emp) => (
                      <option key={emp.id_employee} value={emp.id_employee}>
                        {emp.name} — {emp.role}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="label">Producto</span>
                  <select
                    className="select"
                    value={idProduct}
                    onChange={(e) => setIdProduct(e.target.value)}
                    disabled={saleSaving || products.length === 0}
                  >
                    {products.map((p) => (
                      <option key={p.id_product} value={p.id_product}>
                        {p.name} (stock: {p.stock})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="label">Cantidad</span>
                  <input
                    className="input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    inputMode="numeric"
                    disabled={saleSaving}
                  />
                </label>

                <div className="field actions">
                  <span className="label">Acción</span>
                  <div className="buttonRow">
                    <button className="button primary" type="submit" disabled={saleSaving}>
                      Registrar
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </>
        ) : (
          <p className="status">Tu rol no permite crear ventas desde esta pantalla.</p>
        )}
      </div>
    </section>
  )
}
