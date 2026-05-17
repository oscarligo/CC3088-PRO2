import type { Category, Product, Supplier } from '../../types/domain'

type ProductTableProps = {
  products: Product[]
  categoryById: Map<number, Category>
  supplierById: Map<number, Supplier>
  saving: boolean
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
}

export default function ProductTable({ products, categoryById, supplierById, saving, onEdit, onDelete }: ProductTableProps) {
  return (
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
          {products.map((product) => (
            <tr key={product.id_product}>
              <td className="mono">{product.id_product}</td>
              <td>{product.name}</td>
              <td className="mono">{product.unit_price.toFixed(2)}</td>
              <td className="mono">{product.stock}</td>
              <td>{categoryById.get(product.id_category)?.name ?? product.id_category}</td>
              <td>{supplierById.get(product.id_supplier)?.name ?? product.id_supplier}</td>
              <td className="right">
                <div className="buttonRow compact">
                  <button className="button" type="button" onClick={() => onEdit(product)} disabled={saving}>
                    Editar
                  </button>
                  <button className="button danger" type="button" onClick={() => onDelete(product.id_product)} disabled={saving}>
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
