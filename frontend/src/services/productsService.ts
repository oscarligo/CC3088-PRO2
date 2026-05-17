import { apiJson, apiNoContent } from '../api'
import type { Category, Product, Supplier } from '../types/domain'

type ProductPayload = {
  name: string
  unit_price: number
  stock: number
  id_category: number
  id_supplier: number
}

export function getProducts(apiBaseUrl: string, signal?: AbortSignal) {
  return apiJson<Product[]>(`${apiBaseUrl}/api/products`, { signal })
}

export function getCategories(apiBaseUrl: string, signal?: AbortSignal) {
  return apiJson<Category[]>(`${apiBaseUrl}/api/categories`, { signal })
}

export function getSuppliers(apiBaseUrl: string, signal?: AbortSignal) {
  return apiJson<Supplier[]>(`${apiBaseUrl}/api/suppliers`, { signal })
}

export function createProduct(apiBaseUrl: string, payload: ProductPayload) {
  return apiJson<Product>(`${apiBaseUrl}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function updateProduct(apiBaseUrl: string, id: number, payload: ProductPayload) {
  return apiJson<Product>(`${apiBaseUrl}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function deleteProduct(apiBaseUrl: string, id: number) {
  return apiNoContent(`${apiBaseUrl}/api/products/${id}`, { method: 'DELETE' })
}
