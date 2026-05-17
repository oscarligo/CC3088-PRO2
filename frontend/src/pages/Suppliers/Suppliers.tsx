import { useSuppliersManager } from '../../hooks/useSuppliersManager'
import './Suppliers.css'

export default function Suppliers() {
  const { state, setField, startEdit, resetForm, submit, remove } = useSuppliersManager()

  return (
    <section className="page suppliersPage pageFrame section">
      <header className="pageHeader">
        <span className="eyebrow">Catálogo</span>
        <h2>Proveedores</h2>
        <p className="muted">Formulario controlado con validación cliente y CRUD encapsulado en un hook.</p>
        <div className="buttonRow">
          <button className="button primary" type="button" onClick={resetForm} disabled={state.saving}>
            Nuevo proveedor
           </button>
        </div>
      </header>

      {state.error ? (
        <p className="status error" role="alert">
          Error: {state.error}
        </p>
      ) : null}

      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <div className="formRow">
          <label className="field">
            <span className="label">Nombre</span>
            <input
              className="input"
              value={state.form.name}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="Nombre del proveedor"
              disabled={state.saving}
              required
            />
          </label>

          <label className="field">
            <span className="label">Email</span>
            <input
              className="input"
              value={state.form.email}
              onChange={(event) => setField('email', event.target.value)}
              placeholder="correo@dominio.com"
              disabled={state.saving}
            />
          </label>

          <label className="field">
            <span className="label">Teléfono</span>
            <input
              className="input"
              value={state.form.phone}
              onChange={(event) => setField('phone', event.target.value)}
              placeholder="0000-0000"
              disabled={state.saving}
            />
          </label>

          <div className="field actions">
            <span className="label">Estado</span>
            <p className="muted">{state.editingId != null ? `Editando #${state.editingId}` : 'Creando nuevo registro'}</p>
          </div>
        </div>

        <div className="buttonRow">
          <button className="button primary" type="submit" disabled={state.saving}>
            {state.editingId != null ? 'Actualizar' : 'Crear'}
          </button>
          <button className="button" type="button" onClick={resetForm} disabled={state.saving}>
            Cancelar
          </button>
        </div>

        {state.formError ? (
          <p className="status error" role="alert">
            {state.formError}
          </p>
        ) : null}
      </form>

      {state.loading ? (
        <p className="status">Cargando proveedores...</p>
      ) : state.suppliers.length === 0 ? (
        <p className="status">No hay proveedores.</p>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th className="right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {state.suppliers.map((supplier) => (
                <tr key={supplier.id_supplier}>
                  <td className="mono">{supplier.id_supplier}</td>
                  <td>{supplier.name}</td>
                  <td className="mono">{supplier.email ?? '-'}</td>
                  <td className="mono">{supplier.phone ?? '-'}</td>
                  <td className="right">
                    <div className="buttonRow compact">
                      <button className="button" type="button" onClick={() => startEdit(supplier)} disabled={state.saving}>
                        Editar
                      </button>
                      <button className="button danger" type="button" onClick={() => void remove(supplier.id_supplier)} disabled={state.saving}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
