import { useEffect } from 'react'
import { useProductsManager } from '../../hooks/useProductsManager'

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
    <section className="page pageFrame section">
      <header className="pageHeader">
        <span className="eyebrow">Catálogo</span>
        <h2>Productos</h2>
        <p className="muted">CRUD controlado por hook y validación local antes de llamar al backend.</p>
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
              placeholder="Nombre del producto"
              disabled={state.saving}
              required
            />
          </label>

          <label className="field">
            <span className="label">Precio</span>
            <input
              className="input"
              value={state.form.unitPrice}
              onChange={(event) => setField('unitPrice', event.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              disabled={state.saving}
              required
            />
          </label>

          <label className="field">
            <span className="label">Stock</span>
            <input
              className="input"
              value={state.form.stock}
              onChange={(event) => setField('stock', event.target.value)}
              placeholder="0"
              inputMode="numeric"
              disabled={state.saving}
              required
            />
          </label>

          <div className="field actions">
            <span className="label">Estado</span>
            <p className="muted">{state.editingId != null ? `Editando #${state.editingId}` : 'Creando nuevo registro'}</p>
          </div>
        </div>

        <div className="formRow">
          <label className="field">
            <span className="label">Categoría</span>
            <select
              className="select"
              value={state.form.idCategory}
              onChange={(event) => setField('idCategory', event.target.value)}
              disabled={state.saving || state.categories.length === 0}
            >
              {state.categories.map((category) => (
                <option key={category.id_category} value={category.id_category}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="label">Proveedor</span>
            <select
              className="select"
              value={state.form.idSupplier}
              onChange={(event) => setField('idSupplier', event.target.value)}
              disabled={state.saving || state.suppliers.length === 0}
            >
              {state.suppliers.map((supplier) => (
                <option key={supplier.id_supplier} value={supplier.id_supplier}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </label>

          <div className="field actions">
            <span className="label">Acciones</span>
            <div className="buttonRow">
              <button className="button primary" type="submit" disabled={state.saving}>
                {state.editingId != null ? 'Actualizar' : 'Crear'}
              </button>
              <button className="button" type="button" onClick={resetForm} disabled={state.saving}>
                Cancelar
              </button>
            </div>
          </div>
        </div>

        {state.formError ? (
          <p className="status error" role="alert">
            {state.formError}
          </p>
        ) : null}
      </form>

      {state.loading ? (
        <p className="status">Cargando productos...</p>
      ) : state.products.length === 0 ? (
        <p className="status">No hay productos.</p>
      ) : (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Proveedor</th>
                <th className="right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {state.products.map((product) => (
                <tr key={product.id_product}>
                  <td className="mono">{product.id_product}</td>
                  <td>{product.name}</td>
                  <td className="mono">{product.unit_price.toFixed(2)}</td>
                  <td className="mono">{product.stock}</td>
                  <td>{categoryById.get(product.id_category)?.name ?? product.id_category}</td>
                  <td>{supplierById.get(product.id_supplier)?.name ?? product.id_supplier}</td>
                  <td className="right">
                    <div className="buttonRow compact">
                      <button className="button" type="button" onClick={() => startEdit(product)} disabled={state.saving}>
                        Editar
                      </button>
                      <button className="button danger" type="button" onClick={() => void remove(product.id_product)} disabled={state.saving}>
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
