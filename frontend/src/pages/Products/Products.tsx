import { useEffect } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import { useProductsManager } from '../../hooks/useProductsManager'
import ProductForm from './ProductForm'
import ProductTable from './ProductTable'
import './Products.css'

export default function Products() {
  const { state, categoryById, supplierById, setField, startEdit, startCreate, resetForm, submit, remove } =
    useProductsManager()

  useEffect(() => {
    if (!state.loading && state.form.idCategory === '' && state.categories.length > 0) {
      setField('idCategory', String(state.categories[0].id_category))
    }

    if (!state.loading && state.form.idSupplier === '' && state.suppliers.length > 0) {
      setField('idSupplier', String(state.suppliers[0].id_supplier))
    }
  }, [state.categories, state.form.idCategory, state.form.idSupplier, state.loading, state.suppliers, setField])

  return (
    <section className="page productsPage pageFrame section">
      <PageHeader
        eyebrow="Catálogo"
        title="Productos"
        description="CRUD controlado por hook y validación local antes de llamar al backend."
        actions={
          <div className="buttonRow">
            <button className="button primary" type="button" onClick={startCreate} disabled={state.saving}>
              Nuevo producto
            </button>
            <button className="button" type="button" onClick={() => void submit()} disabled={state.saving}>
              Guardar cambios
            </button>
            <button className="button" type="button" onClick={resetForm} disabled={state.saving}>
              Limpiar formulario
            </button>
          </div>
        }
      />

      {state.error ? (
        <StatusMessage kind="error">Error: {state.error}</StatusMessage>
      ) : null}

      <ProductForm state={state} onFieldChange={setField} onSubmit={submit} onReset={resetForm} />

      {state.loading ? (
        <StatusMessage kind="loading">Cargando productos...</StatusMessage>
      ) : state.products.length === 0 ? (
        <StatusMessage kind="empty">No hay productos.</StatusMessage>
      ) : (
        <ProductTable
          products={state.products}
          categoryById={categoryById}
          supplierById={supplierById}
          saving={state.saving}
          onEdit={startEdit}
          onDelete={(id) => void remove(id)}
        />
      )}
    </section>
  )
}
