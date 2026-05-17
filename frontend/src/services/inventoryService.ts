import { apiJson } from '../api'
import type { InventoryProduct } from '../types/domain'

export function getInventory(apiBaseUrl: string, signal?: AbortSignal) {
  return apiJson<InventoryProduct[]>(`${apiBaseUrl}/api/products/inventory`, { signal })
}
