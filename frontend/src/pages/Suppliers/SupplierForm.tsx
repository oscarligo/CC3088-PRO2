import type { SupplierManagerState } from '../../hooks/useSuppliersManager'
import FormField from '../../components/FormField/FormField'
import './Suppliers.css'

type SupplierFormProps = {
  state: SupplierManagerState
  onFieldChange: (field: 'name' | 'email' | 'phone', value: string) => void
  onSubmit: () => void
  onReset: () => void
}

export default function SupplierForm({ state, onFieldChange, onSubmit, onReset }: SupplierFormProps) {
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
            placeholder="Nombre del proveedor"
            disabled={state.saving}
            required
          />
        </FormField>

        <FormField label="Email">
          <input
            className="input"
            value={state.form.email}
            onChange={(event) => onFieldChange('email', event.target.value)}
            placeholder="correo@dominio.com"
            disabled={state.saving}
          />
        </FormField>

        <FormField label="Teléfono">
          <input
            className="input"
            value={state.form.phone}
            onChange={(event) => onFieldChange('phone', event.target.value)}
            placeholder="0000-0000"
            disabled={state.saving}
          />
        </FormField>

        <FormField label="Estado" className="actions">
          <p className="muted">{state.editingId != null ? `Editando #${state.editingId}` : 'Creando nuevo registro'}</p>
        </FormField>
      </div>

      <div className="buttonRow">
        <button className="button primary" type="submit" disabled={state.saving}>
          {state.editingId != null ? 'Actualizar' : 'Crear'}
        </button>
        <button className="button" type="button" onClick={onReset} disabled={state.saving}>
          Cancelar
        </button>
      </div>

      {state.formError ? (
        <p className="status error" role="alert">
          {state.formError}
        </p>
      ) : null}
    </form>
  )
}
