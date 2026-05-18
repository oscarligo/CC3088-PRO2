import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { SupplierManagerState } from '../../hooks/useSuppliersManager'
import FormField from '../../components/FormField/FormField'
import { supplierFormSchema, type SupplierFormValues } from '../../schemas/forms'
import './Suppliers.css'

type SupplierFormProps = {
  state: SupplierManagerState
  onSubmit: (values: SupplierFormValues) => Promise<boolean> | Promise<void> | void
  onReset: () => void
}

export default function SupplierForm({ state, onSubmit, onReset }: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: state.form,
  })

  useEffect(() => {
    reset(state.form)
  }, [reset, state.form])

  return (
    <form
      className="form"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values)
      })}
    >
      <div className="formRow">
        <FormField label="Nombre" error={errors.name?.message}>
          <input
            className="input"
            placeholder="Nombre del proveedor"
            disabled={state.saving}
            {...register('name')}
          />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <input
            className="input"
            placeholder="correo@dominio.com"
            disabled={state.saving}
            {...register('email')}
          />
        </FormField>

        <FormField label="Teléfono" error={errors.phone?.message}>
          <input
            className="input"
            placeholder="0000-0000"
            disabled={state.saving}
            {...register('phone')}
          />
        </FormField>

        <FormField label="Estado" className="actions" hint="Zod valida el formato antes de enviar.">
          <p className="muted">{state.editingId != null ? `Editando #${state.editingId}` : 'Creando nuevo registro'}</p>
        </FormField>
      </div>

      <div className="buttonRow">
        <button className="button primary" type="submit" disabled={state.saving}>
          {state.editingId != null ? 'Actualizar' : 'Crear'}
        </button>
        <button
          className="button"
          type="button"
          onClick={() => {
            reset(state.form)
            onReset()
          }}
          disabled={state.saving}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
