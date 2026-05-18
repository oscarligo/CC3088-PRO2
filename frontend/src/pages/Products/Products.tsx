import PageHeader from '../../components/PageHeader/PageHeader'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import { useProductsManager } from '../../hooks/useProductsManager'
import ProductForm from './ProductForm'
import ProductTable from './ProductTable'
import './Products.css'

export default function Products() {
  const { state, categoryById, supplierById, startEdit, startCreate, resetForm, submit, remove } =
    useProductsManager()

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
            <button className="button" type="button" onClick={resetForm} disabled={state.saving}>
              Limpiar formulario
            </button>
          </div>
        }
      />

      {state.error ? (
        <StatusMessage kind="error">Error: {state.error}</StatusMessage>
      ) : null}

      <ProductForm state={state} onSubmit={submit} onReset={resetForm} />

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
