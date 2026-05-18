import { useSuppliersManager } from '../../hooks/useSuppliersManager'
import PageHeader from '../../components/PageHeader/PageHeader'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import SupplierForm from './SupplierForm'
import SupplierTable from './SupplierTable'
import './Suppliers.css'

export default function Suppliers() {
  const { state, startEdit, resetForm, submit, remove } = useSuppliersManager()

  return (
    <section className="page suppliersPage pageFrame section">
      <PageHeader
        eyebrow="Catálogo"
        title="Proveedores"
        description="Formulario controlado con validación cliente y CRUD encapsulado en un hook."
        actions={
          <div className="buttonRow">
            <button className="button primary" type="button" onClick={resetForm} disabled={state.saving}>
              Nuevo proveedor
            </button>
          </div>
        }
      />

      {state.error ? (
        <StatusMessage kind="error">Error: {state.error}</StatusMessage>
      ) : null}

      <SupplierForm state={state} onSubmit={submit} onReset={resetForm} />

      {state.loading ? (
        <StatusMessage kind="loading">Cargando proveedores...</StatusMessage>
      ) : state.suppliers.length === 0 ? (
        <StatusMessage kind="empty">No hay proveedores.</StatusMessage>
      ) : (
        <SupplierTable suppliers={state.suppliers} saving={state.saving} onEdit={startEdit} onDelete={(id) => void remove(id)} />
      )}
    </section>
  )
}
