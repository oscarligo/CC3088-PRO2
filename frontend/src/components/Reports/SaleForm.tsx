import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import FormField from '../FormField/FormField'
import type { Client, Employee, Product } from '../../types/domain'
import { saleFormSchema, type SaleFormValues } from '../../schemas/forms.ts'
import '../../pages/Reports/Reports.css'

type SaleFormProps = {
  clients: Client[]
  employees: Employee[]
  products: Product[]
  saving: boolean
  error: string | null
  success: string | null
  onSubmit: (values: SaleFormValues) => Promise<boolean> | Promise<void> | void
}

export default function SaleForm({
  clients,
  employees,
  products,
  saving,
  error,
  success,
  onSubmit,
}: SaleFormProps) {

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      idClient: clients[0] ? String(clients[0].id_client) : '',
      idEmployee: employees[0] ? String(employees[0].id_employee) : '',
      idProduct: products[0] ? String(products[0].id_product) : '',
      amount: '1',
    },
  })

  useEffect(() => {
    reset({
      idClient: clients[0] ? String(clients[0].id_client) : '',
      idEmployee: employees[0] ? String(employees[0].id_employee) : '',
      idProduct: products[0] ? String(products[0].id_product) : '',
      amount: '1',
    } as any)
  }, [clients, employees, products, reset])

  return (
    <section className="reportPanel">
      <h3>Transacción: Registrar venta</h3>
      <p className="muted">
        Si envías una cantidad mayor al stock, el backend hace <code>ROLLBACK</code> y verás el error.
      </p>

      {success ? <p className="status">{success}</p> : null}
      {error ? (
        <p className="status error" role="alert">
          {error}
        </p>
      ) : null}

      <form
        className="form"
        // 3. El handleSubmit entregará 'values' ya transformado (IDs y Amount como números reales)
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values as SaleFormValues)
        })}
      >
        <div className="formRow">
          <FormField label="Cliente" error={errors.idClient?.message}>
            <select className="select" disabled={saving || clients.length === 0} {...register('idClient')}>
              {/* Opción vacía por si el cliente no es obligatorio */}
              <option value="">Selecciona un cliente (Opcional)</option>
              {clients.map((client) => (
                <option key={client.id_client} value={client.id_client}>
                  {client.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Empleado" error={errors.idEmployee?.message}>
            <select className="select" disabled={saving || employees.length === 0} {...register('idEmployee')}>
              <option value="">Selecciona un empleado</option>
              {employees.map((employee) => (
                <option key={employee.id_employee} value={employee.id_employee}>
                  {employee.name} — {employee.role}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Producto" error={errors.idProduct?.message}>
            <select className="select" disabled={saving || products.length === 0} {...register('idProduct')}>
              <option value="">Selecciona un producto</option>
              {products.map((product) => (
                <option key={product.id_product} value={product.id_product}>
                  {product.name} (stock: {product.stock})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Cantidad" error={errors.amount?.message}>
            <input className="input" inputMode="numeric" disabled={saving} {...register('amount')} />
          </FormField>
        </div>

        <div className="buttonRow">
          <button className="button primary" type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Registrar venta'}
          </button>
        </div>
      </form>
    </section>
  )
}