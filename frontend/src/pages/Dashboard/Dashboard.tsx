import { Link } from 'react-router'

const cards = [
  { title: 'Productos', description: 'CRUD con categorías y proveedores', to: '/products' },
  { title: 'Proveedores', description: 'Altas, ediciones y eliminaciones', to: '/suppliers' },
  { title: 'Inventario', description: 'Vista del stock disponible', to: '/inventory' },
  { title: 'Reportes', description: 'Consultas SQL y registro de ventas', to: '/reports' },
]

export default function Dashboard() {
  return (
    <section className="page pageFrame">
      <header className="pageHeader">
        <span className="eyebrow">Inicio</span>
        <h2>Panel principal</h2>
        <p className="muted">
          La aplicación ya queda separada por rutas y preparada para que la lógica viva en servicios,
          contexto y hooks.
        </p>
      </header>

      <div className="dashboardHero">
        <div>
          <h1>Arquitectura modular para el frontend</h1>
          <p className="muted">
            Cada módulo de negocio se organiza en su propia ruta, con formularios controlados y
            validación cliente sin llamadas al API dentro de los componentes.
          </p>
        </div>

        <div className="dashboardActions">
          {cards.map((card) => (
            <Link key={card.to} to={card.to} className="button primary">
              Ir a {card.title}
            </Link>
          ))}
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
