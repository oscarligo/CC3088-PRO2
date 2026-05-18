import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supplierFormSchema, type SupplierFormValues } from '../../schemas/forms'
import type { Supplier } from '../../types/domain'
import FormField from '../FormField/FormField' 

type SupplierFormProps = {
  initialValues: Supplier | null 
  saving: boolean
  onSubmit: (values: SupplierFormValues) => Promise<boolean | void>
  onCancel: () => void
}

export default function SupplierForm({ initialValues, saving, onSubmit, onCancel }: SupplierFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      email: initialValues?.email ?? '',
      phone: initialValues?.phone ?? '',
    }
  })

  const handleFormSubmit = async (values: SupplierFormValues) => {
    await onSubmit(values)
  }

  return (
    <form className="form" onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="formRow">
        <FormField label="Nombre" error={errors.name?.message}>
          <input
            className="input"
            placeholder="Nombre del proveedor"
            disabled={saving}
            {...register('name')}
          />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <input
            className="input"
            placeholder="Correo electrónico (opcional)"
            disabled={saving}
            {...register('email')}
          />
        </FormField>

        <FormField label="Teléfono" error={errors.phone?.message}>
          <input
            className="input"
            placeholder="Número de teléfono (opcional)"
            disabled={saving}
            {...register('phone')}
          />
        </FormField>    
      </div>

      <div className="buttonRow">
        <button className="button primary" type="submit" disabled={saving}>
          {initialValues != null ? 'Actualizar' : 'Crear'}
        </button>
        <button className="button" type="button" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
      </div>
    </form>
  )
}