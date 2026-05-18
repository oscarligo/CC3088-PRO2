import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
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
import type { SaleFormValues } from '../../schemas/forms'
import ReportSection from '../../components/Reports/ReportSection'
import SaleForm from '../../components/Reports/SaleForm'
import './Reports.css'

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

  const submitSale = async (values: SaleFormValues) => {
    setSaleError(null)
    setSaleSuccess(null)

    const idClientNumber = Number(values.idClient)
    const idEmployeeNumber = Number(values.idEmployee)
    const idProductNumber = Number(values.idProduct)
    const amountNumber = Number(values.amount)
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
    <section className="page reportsPage pageFrame section">
      <PageHeader
        eyebrow="Analítica"
        title="Reportes"
        description="Consultas de SQL y registro de ventas coordinados desde servicios reutilizables."
        actions={
          <div className="buttonRow">
            <button className="button" type="button" onClick={() => void reload()} disabled={loading}>
              Recargar
            </button>
          </div>
        }
      />

      {loading ? <StatusMessage kind="loading">Cargando reportes...</StatusMessage> : null}
      {error ? (
        <StatusMessage kind="error">Error: {error}</StatusMessage>
      ) : null}

      <div className="reportsGrid">
        <ReportSection title="Detalle de ventas" api={urls.saleLines}>
          {saleLines.length === 0 ? (
            <StatusMessage kind="empty">Sin datos.</StatusMessage>
          ) : (
            <div className="reportTableWrap tableWrap">
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
        </ReportSection>

        <ReportSection title="Productos por proveedor" api={urls.supplierProductCount}>
          {supplierCounts.length === 0 ? (
            <StatusMessage kind="empty">Sin datos.</StatusMessage>
          ) : (
            <div className="reportTableWrap tableWrap">
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
        </ReportSection>

        <ReportSection title="Ventas por categoría" api={urls.categorySales}>
          {categorySales.length === 0 ? (
            <StatusMessage kind="empty">Sin datos.</StatusMessage>
          ) : (
            <div className="reportTableWrap tableWrap">
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
        </ReportSection>

        <ReportSection title="Productos sin ventas" api={urls.unsoldProducts}>
          {unsoldProducts.length === 0 ? (
            <StatusMessage kind="empty">Sin datos (todos tienen ventas).</StatusMessage>
          ) : (
            <div className="reportTableWrap tableWrap">
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
        </ReportSection>

        <ReportSection title="Top clientes por gasto" api={urls.topClients}>
          {topClients.length === 0 ? (
            <StatusMessage kind="empty">Sin datos.</StatusMessage>
          ) : (
            <div className="reportTableWrap tableWrap">
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
        </ReportSection>
      </div>

      <SaleForm
        clients={clients}
        employees={employees}
        products={products}
        saving={saleSaving}
        error={saleError}
        success={saleSuccess}
        onSubmit={submitSale}
      />
    </section>
  )
}
