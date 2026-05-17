import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/Layout/AppLayout'
import { AppConfigProvider } from './context/AppConfigContext/AppConfigContext'
import Dashboard from './pages/Dashboard/Dashboard'
import Inventory from './pages/Inventory/Inventory'
import NotFound from './pages/NotFound/NotFound'
import Products from './pages/Products/Products'
import Reports from './pages/Reports/Reports'
import Suppliers from './pages/Suppliers/Suppliers'

function App() {
  return (
    <AppConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppConfigProvider>
  )
}

export default App
