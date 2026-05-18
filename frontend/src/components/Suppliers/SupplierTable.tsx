import type { Supplier } from '../../types/domain'

type SupplierTableProps = {
  suppliers: Supplier[]
  saving: boolean
  onEdit: (supplier: Supplier) => void
  onDelete: (id: number) => void
}

export default function SupplierTable({ suppliers, saving, onEdit, onDelete }: SupplierTableProps) {
  return (
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
          {suppliers.map((supplier) => (
            <tr key={supplier.id_supplier}>
              <td className="mono">{supplier.id_supplier}</td>
              <td>{supplier.name}</td>
              <td className="mono">{supplier.email ?? '-'}</td>
              <td className="mono">{supplier.phone ?? '-'}</td>
              <td className="right">
                <div className="buttonRow compact">
                  <button className="button" type="button" onClick={() => onEdit(supplier)} disabled={saving}>
                    Editar
                  </button>
                  <button className="button danger" type="button" onClick={() => onDelete(supplier.id_supplier)} disabled={saving}>
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
