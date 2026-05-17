import { NavLink, Outlet } from 'react-router'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Productos' },
  { to: '/suppliers', label: 'Proveedores' },
  { to: '/inventory', label: 'Inventario' },
  { to: '/reports', label: 'Reportes' },
]

export default function AppLayout() {
  return (
    <div className="appShell">
      <header className="appHeader">
        <div className="appHeaderCard">
          <div className="appBrand">
            <div className="brandCopy">
              <h1 className="brandTitle">CC3088-PRO2</h1>
              <p className="brandSubtitle">React Router, servicios y formularios controlados</p>
            </div>

            <nav className="appNav" aria-label="Principal">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `navLink${isActive ? ' active' : ''}`}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="appMain">
        <Outlet />
      </main>
    </div>
  )
}
