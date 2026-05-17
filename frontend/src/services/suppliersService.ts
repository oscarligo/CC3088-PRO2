import { apiJson, apiNoContent } from '../api'
import type { Supplier } from '../types/domain'

type SupplierPayload = {
  name: string
  email: string | null
  phone: string | null
}

export function getSuppliers(apiBaseUrl: string, signal?: AbortSignal) {
  return apiJson<Supplier[]>(`${apiBaseUrl}/api/suppliers`, { signal })
}

export function createSupplier(apiBaseUrl: string, payload: SupplierPayload) {
  return apiJson<Supplier>(`${apiBaseUrl}/api/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function updateSupplier(apiBaseUrl: string, id: number, payload: SupplierPayload) {
  return apiJson<Supplier>(`${apiBaseUrl}/api/suppliers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function deleteSupplier(apiBaseUrl: string, id: number) {
  return apiNoContent(`${apiBaseUrl}/api/suppliers/${id}`, { method: 'DELETE' })
}
