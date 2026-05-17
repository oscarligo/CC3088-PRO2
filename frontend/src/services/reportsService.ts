import { apiJson } from '../api'
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
} from '../types/domain'

export function getReportData(apiBaseUrl: string, signal?: AbortSignal) {
  return Promise.all([
    apiJson<SaleLine[]>(`${apiBaseUrl}/api/reports/sale-lines`, { signal }),
    apiJson<SupplierProductCount[]>(`${apiBaseUrl}/api/reports/supplier-product-count?min_products=1`, { signal }),
    apiJson<CategorySales[]>(`${apiBaseUrl}/api/reports/category-sales?min_total=0`, { signal }),
    apiJson<InventoryProduct[]>(`${apiBaseUrl}/api/reports/unsold-products`, { signal }),
    apiJson<Client[]>(`${apiBaseUrl}/api/reports/clients-min-sales?min_sales=2`, { signal }),
    apiJson<TopClient[]>(`${apiBaseUrl}/api/reports/top-clients?limit=10`, { signal }),
    apiJson<Client[]>(`${apiBaseUrl}/api/clients`, { signal }),
    apiJson<Employee[]>(`${apiBaseUrl}/api/employees`, { signal }),
    apiJson<Product[]>(`${apiBaseUrl}/api/products`, { signal }),
  ]).then(
    ([saleLines, supplierProductCount, categorySales, unsoldProducts, clientsMinSales, topClients, clients, employees, products]) => ({
      saleLines,
      supplierProductCount,
      categorySales,
      unsoldProducts,
      clientsMinSales,
      topClients,
      clients,
      employees,
      products,
    }),
  )
}

export function createSale(apiBaseUrl: string, body: {
  id_client: number | null
  id_employee: number
  items: Array<{ id_product: number; amount: number }>
}) {
  return apiJson<CreateSaleResponse>(`${apiBaseUrl}/api/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
