import type { ProductManagerState } from '../../hooks/useProductsManager'
import FormField from '../../components/FormField/FormField'
import './Products.css'

type ProductFormProps = {
  state: ProductManagerState
  onFieldChange: (field: 'name' | 'unitPrice' | 'stock' | 'idCategory' | 'idSupplier', value: string) => void
  onSubmit: () => void
  onReset: () => void
}

export default function ProductForm({ state, onFieldChange, onSubmit, onReset }: ProductFormProps) {
  return (
    <form
      className="form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="formRow">
        <FormField label="Nombre">
          <input
            className="input"
            value={state.form.name}
            onChange={(event) => onFieldChange('name', event.target.value)}
            placeholder="Nombre del producto"
            disabled={state.saving}
            required
          />
        </FormField>

        <FormField label="Precio">
          <input
            className="input"
            value={state.form.unitPrice}
            onChange={(event) => onFieldChange('unitPrice', event.target.value)}
            placeholder="0.00"
            inputMode="decimal"
            disabled={state.saving}
            required
          />
        </FormField>

        <FormField label="Stock">
          <input
            className="input"
            value={state.form.stock}
            onChange={(event) => onFieldChange('stock', event.target.value)}
            placeholder="0"
            inputMode="numeric"
            disabled={state.saving}
            required
          />
        </FormField>

        <FormField label="Estado" className="actions">
          <p className="muted">{state.editingId != null ? `Editando #${state.editingId}` : 'Creando nuevo registro'}</p>
        </FormField>
      </div>

      <div className="formRow">
        <FormField label="Categoría">
          <select
            className="select"
            value={state.form.idCategory}
            onChange={(event) => onFieldChange('idCategory', event.target.value)}
            disabled={state.saving || state.categories.length === 0}
          >
            {state.categories.map((category) => (
              <option key={category.id_category} value={category.id_category}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Proveedor">
          <select
            className="select"
            value={state.form.idSupplier}
            onChange={(event) => onFieldChange('idSupplier', event.target.value)}
            disabled={state.saving || state.suppliers.length === 0}
          >
            {state.suppliers.map((supplier) => (
              <option key={supplier.id_supplier} value={supplier.id_supplier}>
                {supplier.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Acciones" className="actions">
          <div className="buttonRow">
            <button className="button primary" type="submit" disabled={state.saving}>
              {state.editingId != null ? 'Actualizar' : 'Crear'}
            </button>
            <button className="button" type="button" onClick={onReset} disabled={state.saving}>
              Cancelar
            </button>
          </div>
        </FormField>
      </div>

      {state.formError ? (
        <p className="status error" role="alert">
          {state.formError}
        </p>
      ) : null}
    </form>
  )
}
