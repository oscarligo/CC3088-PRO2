import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppConfig } from '../../context/AppConfigContext/useAppConfig'
import { 
  getProducts, 
  getCategories, 
  getSuppliers, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../../services/productsService'

import PageHeader from '../../components/PageHeader/PageHeader'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import ProductForm from '../../components/Products/ProductForm'
import ProductTable from '../../components/Products/ProductTable'
import type { Product } from '../../types/domain'
import { type ProductFormValues } from '../../schemas/forms'
import './Products.css'

export default function Products() {
  const { apiBaseUrl } = useAppConfig()
  const queryClient = useQueryClient()

  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const { data: products = [], isLoading: loadingProducts, error: errorProducts } = useQuery({
    queryKey: ['products', apiBaseUrl],
    queryFn: () => getProducts(apiBaseUrl),
  })

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories', apiBaseUrl],
    queryFn: () => getCategories(apiBaseUrl),
  })

  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
    queryKey: ['suppliers', apiBaseUrl],
    queryFn: () => getSuppliers(apiBaseUrl),
  })

  const saveMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const payload = {
        name: values.name.trim(),
        unit_price: values.unitPrice, 
        stock: values.stock,     
        id_category: values.idCategory,
        id_supplier: values.idSupplier,
      }

      if (editingProduct != null) {
        return updateProduct(apiBaseUrl, editingProduct.id_product, payload)
      }
      return createProduct(apiBaseUrl, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', apiBaseUrl] })
      setEditingProduct(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(apiBaseUrl, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', apiBaseUrl] })
      if (editingProduct?.id_product === editingProduct?.id_product) {
        setEditingProduct(null)
      }
    },
  })


  const categoryById = new Map(categories.map((c) => [c.id_category, c]))
  const supplierById = new Map(suppliers.map((s) => [s.id_supplier, s]))

  const globalLoading = loadingProducts || loadingCategories || loadingSuppliers
  const globalError = errorProducts ? (errorProducts as Error).message : null
  const saving = saveMutation.isPending || deleteMutation.isPending

  return (
    <section className="page productsPage pageFrame section">
      <PageHeader
        eyebrow="Catálogo"
        title="Productos"
        description="CRUD optimizado mediante estados asíncronos distribuidos con React Query."
        actions={
          <div className="buttonRow">
            <button 
              className="button primary" 
              type="button" 
              onClick={() => setEditingProduct(null)} 
              disabled={saving}
            >
              Nuevo producto
            </button>
          </div>
        }
      />

      {globalError ? (
        <StatusMessage kind="error">Error: {globalError}</StatusMessage>
      ) : null}

      {saveMutation.error ? (
        <StatusMessage kind="error">Error al guardar: {(saveMutation.error as Error).message}</StatusMessage>
      ) : null}

      <ProductForm
        initialValues={editingProduct}
        categories={categories}
        suppliers={suppliers}
        saving={saving}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values)
        }}
        onCancel={() => setEditingProduct(null)}
      />

      {globalLoading ? (
        <StatusMessage kind="loading">Cargando productos...</StatusMessage>
      ) : products.length === 0 ? (
        <StatusMessage kind="empty">No hay productos.</StatusMessage>
      ) : (
        <ProductTable
          products={products}
          categoryById={categoryById}
          supplierById={supplierById}
          saving={saving}
          onEdit={(product) => setEditingProduct(product)}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      )}
    </section>
  )
}