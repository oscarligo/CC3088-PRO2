export type Category = {
  id_category: number
  name: string
  description: string | null
}

export type Supplier = {
  id_supplier: number
  name: string
  email: string | null
  phone: string | null
}

export type Product = {
  id_product: number
  name: string
  unit_price: number
  stock: number
  id_category: number
  id_supplier: number
}

export type InventoryProduct = {
  id_product: number
  product_name: string
  unit_price: number
  stock: number
  category_name: string
  supplier_name: string
}

export type SaleLine = {
  id_sale: number
  sale_date: string
  client_name: string | null
  employee_name: string
  product_name: string
  amount: number
  sale_price: number
  line_total: number
}

export type SupplierProductCount = {
  id_supplier: number
  supplier_name: string
  products_count: number
  avg_unit_price: number | null
}

export type CategorySales = {
  id_category: number
  category_name: string
  items_sold: number
  sales_count: number
  total_revenue: number
}

export type Client = {
  id_client: number
  name: string
  nit: string | null
  email: string | null
}

export type TopClient = {
  id_client: number
  client_name: string
  total_spent: number
  sales_count: number
}

export type Employee = {
  id_employee: number
  name: string
  role: string
}

export type CreateSaleResponse = {
  id_sale: number
}
