import { NavLink, Outlet } from 'react-router'
import { useTheme } from '../../context/ThemeContext/useTheme'
import './NavBar.css'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/products', label: 'Productos' },
  { to: '/suppliers', label: 'Proveedores' },
  { to: '/inventory', label: 'Inventario' },
  { to: '/reports', label: 'Reportes' },
]

export default function NavBar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="appShell">
      <header className="appHeader">
        <div className="appHeaderCard">
          <div className="appBrand">
            <div className="brandCopy">
              <h1 className="brandTitle">CC3062-PRO2</h1>
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

              <button className="themeToggle" type="button" onClick={toggleTheme} aria-label="Cambiar tema">
                <span className="themeToggleMark" aria-hidden="true" />
                {theme === 'dark' ? 'Claro' : 'Oscuro'}
              </button>
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
