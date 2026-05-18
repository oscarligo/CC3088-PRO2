import { Link } from 'react-router'
import './Dashboard.css'

const cards = [
  { title: 'Productos', description: 'CRUD completo para productos', to: '/products' },
  { title: 'Proveedores', description: 'CRUD completo para proveedores', to: '/suppliers' },
  { title: 'Inventario', description: 'Vista del stock disponible', to: '/inventory' },
  { title: 'Reportes', description: 'Consultas SQL y registro de ventas', to: '/reports' },
]

export default function Dashboard() {
  return (
    <section className="page dashboardPage pageFrame">

      <div className="dashboardHero">
        <div>
          <h1>Aplicación web para gestionar el inventario y las ventas de una tienda. </h1>
          <p className="muted">
            La tienda maneja productos agrupados en categorías, comprados a proveedores. Los clientes
            realizan compras atendidas por empleados. Cada compra puede incluir varios productos y debe
            quedar registrada junto con el detalle de lo vendido. La tienda necesita controlar el stock 
            disponible.
          </p>
        </div>

      </div>

      <div className="dashboardCardGrid">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="dashboardCard">
            <strong>{card.title}</strong>
            <span>{card.description}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
