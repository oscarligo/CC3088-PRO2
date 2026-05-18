import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { ProductManagerState } from '../../hooks/useProductsManager'
import FormField from '../../components/FormField/FormField'
import { productFormSchema, type ProductFormValues } from '../../schemas/forms'
import './Products.css'

type ProductFormProps = {
  state: ProductManagerState
  onSubmit: (values: ProductFormValues) => Promise<boolean> | Promise<void> | void
  onReset: () => void
}

export default function ProductForm({ state, onSubmit, onReset }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
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
            placeholder="Nombre del producto"
            disabled={state.saving}
            {...register('name')}
          />
        </FormField>

        <FormField label="Precio" error={errors.unitPrice?.message}>
          <input
            className="input"
            placeholder="0.00"
            inputMode="decimal"
            disabled={state.saving}
            {...register('unitPrice')}
          />
        </FormField>

        <FormField label="Stock" error={errors.stock?.message}>
          <input
            className="input"
            placeholder="0"
            inputMode="numeric"
            disabled={state.saving}
            {...register('stock')}
          />
        </FormField>

        <FormField label="Estado" className="actions" hint="El formulario valida con Zod antes de enviar.">
          <p className="muted">{state.editingId != null ? `Editando #${state.editingId}` : 'Creando nuevo registro'}</p>
        </FormField>
      </div>

      <div className="formRow">
        <FormField label="Categoría" error={errors.idCategory?.message}>
          <select
            className="select"
            disabled={state.saving || state.categories.length === 0}
            {...register('idCategory')}
          >
            {state.categories.map((category) => (
              <option key={category.id_category} value={category.id_category}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Proveedor" error={errors.idSupplier?.message}>
          <select
            className="select"
            disabled={state.saving || state.suppliers.length === 0}
            {...register('idSupplier')}
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
        </FormField>
      </div>
    </form>
  )
}
