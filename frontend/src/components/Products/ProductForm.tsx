import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import FormField from '../../components/FormField/FormField'
import { productFormSchema, type ProductFormValues } from '../../schemas/forms.ts'
import type { Category, Supplier, Product } from '../../types/domain'

type ProductFormProps = {
  initialValues: Product | null
  categories: Category[]
  suppliers: Supplier[]
  saving: boolean
  onSubmit: (values: ProductFormValues) => Promise<boolean> | Promise<void> | void
  onCancel: () => void
}

export default function ProductForm({
  initialValues,
  categories,
  suppliers,
  saving,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      unitPrice: initialValues?.unit_price ?? '',
      stock: initialValues?.stock ?? '',
      idCategory: initialValues?.id_category ?? '',
      idSupplier: initialValues?.id_supplier ?? '',
    },
  })

  return (
    <form
      className="form"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values as ProductFormValues)
      })}
    >
      <div className="formRow">
        <FormField label="Nombre" error={errors.name?.message}>
          <input
            className="input"
            placeholder="Nombre del producto"
            disabled={saving}
            {...register('name')}
          />
        </FormField>

        <FormField label="Precio" error={errors.unitPrice?.message}>
          <input
            className="input"
            placeholder="0.00"
            inputMode="decimal"
            disabled={saving}
            {...register('unitPrice', {
              setValueAs: (value) => (value === '' ? value : Number(value)),
            })}
          />
        </FormField>

        <FormField label="Stock" error={errors.stock?.message}>
          <input
            className="input"
            placeholder="0"
            inputMode="numeric"
            disabled={saving}
            {...register('stock', {
              setValueAs: (value) => (value === '' ? value : Number(value)),
            })}
          />
        </FormField>
      </div>

      <div className="formRow">
        <FormField label="Categoría" error={errors.idCategory?.message}>
          <select
            className="select"
            disabled={saving || categories.length === 0}
            {...register('idCategory', {
              setValueAs: (value) => (value === '' ? value : Number(value)),
            })}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id_category} value={category.id_category}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Proveedor" error={errors.idSupplier?.message}>
          <select
            className="select"
            disabled={saving || suppliers.length === 0}
            {...register('idSupplier', {
              setValueAs: (value) => (value === '' ? value : Number(value)),
            })}
          >
            <option value="">Selecciona un proveedor</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id_supplier} value={supplier.id_supplier}>
                {supplier.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Acciones" className="actions">
          <div className="buttonRow">
            <button className="button primary" type="submit" disabled={saving}>
              {initialValues != null ? 'Actualizar' : 'Crear'}
            </button>
            <button
              className="button"
              type="button"
              onClick={onCancel}
              disabled={saving}
            >
              Cancelar
            </button>
          </div>
        </FormField>
      </div>
    </form>
  )
}