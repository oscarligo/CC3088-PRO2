import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import { useAppConfig } from '../../context/AppConfigContext/useAppConfig'
import { createSale, getReportData } from '../../services/reportsService'

import PageHeader from '../../components/PageHeader/PageHeader'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import ReportSection from '../../components/Reports/ReportSection'
import SaleForm from '../../components/Reports/SaleForm'
import type { SaleFormValues } from '../../schemas/forms'
import './Reports.css'

export default function Reports() {
  const { apiBaseUrl } = useAppConfig()
  const queryClient = useQueryClient()

  const [
    reportsQuery    
  ] = useQueries({
    queries: [
      {
        queryKey: ['reportData', apiBaseUrl],
        queryFn: ({ signal }) => getReportData(apiBaseUrl, signal),
      },
    
    ]
  })

  const { 
    saleLines = [],
    supplierProductCount = [],
    categorySales = [],
    unsoldProducts = [],
    topClients = [],
    clients = [],
    employees = [],
    products = []
  } = reportsQuery.data ?? {}


  const saleMutation = useMutation({
    mutationFn: async (values: SaleFormValues) => {
      const idClientNumber = Number(values.idClient)
      const idClientPayload = Number.isInteger(idClientNumber) && idClientNumber > 0 ? idClientNumber : null

      const payload = {
        id_client: idClientPayload,
        id_employee: Number(values.idEmployee),
        items: [{ 
          id_product: Number(values.idProduct), 
          amount: Number(values.amount) 
        }],
      }

      return createSale(apiBaseUrl, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportData', apiBaseUrl] })
    }
  })


  const globalLoading = reportsQuery.isLoading
  const globalError = reportsQuery.error ? (reportsQuery.error as Error).message : null
  const saving = saleMutation.isPending

  const saleError = saleMutation.error ? (saleMutation.error as Error).message : null
  const saleSuccess = saleMutation.isSuccess 
    ? `Venta creada con éxito (ID: ${saleMutation.data?.id_sale})` 
    : null

  return (
    <section className="page reportsPage pageFrame section">
      <PageHeader
        eyebrow="Analítica"
        title="Reportes"
        description="Consultas de SQL y registro de ventas."
        actions={
          <div className="buttonRow">
            <button 
              className="button" 
              type="button" 
              onClick={() => {
                void queryClient.invalidateQueries({ queryKey: ['reportData', apiBaseUrl] })
              }} 
              disabled={globalLoading}
            >
              Recargar
            </button>
          </div>
        }
      />

      {globalLoading ? <StatusMessage kind="loading">Cargando reportes...</StatusMessage> : null}
      
      {globalError ? (
        <StatusMessage kind="error">Error al cargar reportes: {globalError}</StatusMessage>
      ) : null}

      <div className="reportsGrid">
        {/* REPORT SECTION 1: DETALLE DE VENTAS */}
        <ReportSection title="Detalle de ventas" api={`${apiBaseUrl}/api/reports/sale-lines`}>
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
                  {saleLines.map((line, idx) => (
                    <tr key={`${line.id_sale}-${idx}`}>
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

        <ReportSection title="Productos por proveedor" api={`${apiBaseUrl}/api/reports/supplier-product-count?min_products=1`}>
          {supplierProductCount.length === 0 ? (
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
                  {supplierProductCount.map((row) => (
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

        <ReportSection title="Ventas por categoría" api={`${apiBaseUrl}/api/reports/category-sales?min_total=0`}>
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

        <ReportSection title="Productos sin ventas" api={`${apiBaseUrl}/api/reports/unsold-products`}>
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

        <ReportSection title="Top clientes por gasto" api={`${apiBaseUrl}/api/reports/top-clients?limit=10`}>
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
        saving={saving}
        error={saleError}
        success={saleSuccess}
        onSubmit={async (values) => {
          await saleMutation.mutateAsync(values)
        }}
      />
    </section>
  )
}