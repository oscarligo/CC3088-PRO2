import FormField from '../../components/FormField/FormField'
import type { Client, Employee, Product } from '../../types/domain'
import './Reports.css'

type SaleFormProps = {
  clients: Client[]
  employees: Employee[]
  products: Product[]
  idClient: string
  idEmployee: string
  idProduct: string
  amount: string
  saving: boolean
  error: string | null
  success: string | null
  onClientChange: (value: string) => void
  onEmployeeChange: (value: string) => void
  onProductChange: (value: string) => void
  onAmountChange: (value: string) => void
  onSubmit: () => void
}

export default function SaleForm({
  clients,
  employees,
  products,
  idClient,
  idEmployee,
  idProduct,
  amount,
  saving,
  error,
  success,
  onClientChange,
  onEmployeeChange,
  onProductChange,
  onAmountChange,
  onSubmit,
}: SaleFormProps) {
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
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <div className="formRow">
          <FormField label="Cliente">
            <select className="select" value={idClient} onChange={(event) => onClientChange(event.target.value)} disabled={saving || clients.length === 0}>
              {clients.map((client) => (
                <option key={client.id_client} value={client.id_client}>
                  {client.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Empleado">
            <select className="select" value={idEmployee} onChange={(event) => onEmployeeChange(event.target.value)} disabled={saving || employees.length === 0}>
              {employees.map((employee) => (
                <option key={employee.id_employee} value={employee.id_employee}>
                  {employee.name} — {employee.role}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Producto">
            <select className="select" value={idProduct} onChange={(event) => onProductChange(event.target.value)} disabled={saving || products.length === 0}>
              {products.map((product) => (
                <option key={product.id_product} value={product.id_product}>
                  {product.name} (stock: {product.stock})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Cantidad">
            <input className="input" value={amount} onChange={(event) => onAmountChange(event.target.value)} inputMode="numeric" disabled={saving} />
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
