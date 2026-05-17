import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { apiJson, apiNoContent } from '../../api'

type Product = {
  id_product: number
  name: string
  unit_price: number
  stock: number
  id_category: number
  id_supplier: number
}

type Category = {
  id_category: number
  name: string
  description: string | null
}

type Supplier = {
  id_supplier: number
  name: string
  email: string | null
  phone: string | null
}

type Props = {
  apiBaseUrl: string
}

export default function ProductsScreen({ apiBaseUrl }: Props) {
  const productsUrl = `${apiBaseUrl}/api/products`
  const categoriesUrl = `${apiBaseUrl}/api/categories`
  const suppliersUrl = `${apiBaseUrl}/api/suppliers`

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  const categoryById = useMemo(() => {
    const map = new Map<number, Category>()
    for (const c of categories) map.set(c.id_category, c)
    return map
  }, [categories])

  const supplierById = useMemo(() => {
    const map = new Map<number, Supplier>()
    for (const s of suppliers) map.set(s.id_supplier, s)
    return map
  }, [suppliers])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [stock, setStock] = useState('')
  const [idCategory, setIdCategory] = useState<string>('')
  const [idSupplier, setIdSupplier] = useState<string>('')

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setUnitPrice('')
    setStock('')
    setFormError(null)
    if (categories.length > 0) setIdCategory(String(categories[0].id_category))
    if (suppliers.length > 0) setIdSupplier(String(suppliers[0].id_supplier))
  }

  const reload = async (signal?: AbortSignal) => {
    const [p, c, s] = await Promise.all([
      apiJson<Product[]>(productsUrl, { signal }),
      apiJson<Category[]>(categoriesUrl, { signal }),
      apiJson<Supplier[]>(suppliersUrl, { signal }),
    ])

    setProducts(p)
    setCategories(c)
    setSuppliers(s)

    if (!idCategory && c.length > 0) setIdCategory(String(c[0].id_category))
    if (!idSupplier && s.length > 0) setIdSupplier(String(s[0].id_supplier))
  }

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      setLoading(true)
      setError(null)

      try {
        await reload(controller.signal)
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    void load()

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsUrl, categoriesUrl, suppliersUrl])

  const startEdit = (p: Product) => {
    setEditingId(p.id_product)
    setName(p.name)
    setUnitPrice(String(p.unit_price))
    setStock(String(p.stock))
    setIdCategory(String(p.id_category))
    setIdSupplier(String(p.id_supplier))
    setFormError(null)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setFormError('El nombre es obligatorio')
      return
    }

    const unitPriceNumber = Number(unitPrice)
    if (!Number.isFinite(unitPriceNumber) || unitPriceNumber < 0) {
      setFormError('El precio debe ser un número >= 0')
      return
    }

    const stockNumber = Number(stock)
    if (!Number.isInteger(stockNumber) || stockNumber < 0) {
      setFormError('El stock debe ser un entero >= 0')
      return
    }

    const idCategoryNumber = Number(idCategory)
    const idSupplierNumber = Number(idSupplier)

    if (!Number.isInteger(idCategoryNumber) || idCategoryNumber <= 0) {
      setFormError('Selecciona una categoría válida')
      return
    }

    if (!Number.isInteger(idSupplierNumber) || idSupplierNumber <= 0) {
      setFormError('Selecciona un proveedor válido')
      return
    }

    setSaving(true)
    setError(null)

    const body = JSON.stringify({
      name: trimmedName,
      unit_price: unitPriceNumber,
      stock: stockNumber,
      id_category: idCategoryNumber,
      id_supplier: idSupplierNumber,
    })

    try {
      if (editingId) {
        await apiJson<Product>(`${productsUrl}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body,
        })
      } else {
        await apiJson<Product>(productsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        })
      }

      await reload()
      resetForm()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    setError(null)
    setSaving(true)
    try {
      await apiNoContent(`${productsUrl}/${id}`, { method: 'DELETE' })
      await reload()
      if (editingId === id) resetForm()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="section">
      <header className="sectionHeader">
        <h2>Productos</h2>
      </header>

      {error ? (
        <p className="status error" role="alert">
          Error: {error}
        </p>
      ) : null}

      <form className="form" onSubmit={submit}>
        <div className="formRow">
          <label className="field">
            <span className="label">Nombre</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del producto"
              disabled={saving}
              required
            />
          </label>

          <label className="field">
            <span className="label">Precio</span>
            <input
              className="input"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              disabled={saving}
              required
            />
          </label>

          <label className="field">
            <span className="label">Stock</span>
            <input
              className="input"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              inputMode="numeric"
              disabled={saving}
              required
            />
          </label>
        </div>

        <div className="formRow">
          <label className="field">
            <span className="label">Categoría</span>
            <select
              className="select"
              value={idCategory}
              onChange={(e) => setIdCategory(e.target.value)}
              disabled={saving || categories.length === 0}
            >
              {categories.map((c) => (
                <option key={c.id_category} value={c.id_category}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="label">Proveedor</span>
            <select
              className="select"
              value={idSupplier}
              onChange={(e) => setIdSupplier(e.target.value)}
              disabled={saving || suppliers.length === 0}
            >
              {suppliers.map((s) => (
                <option key={s.id_supplier} value={s.id_supplier}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <div className="field actions">
            <span className="label">Acciones</span>
            <div className="buttonRow">
              <button className="button primary" type="submit" disabled={saving}>
                {editingId ? 'Guardar' : 'Crear'}
              </button>
              <button
                className="button"
                type="button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>

        {formError ? (
          <p className="status error" role="alert">
            {formError}
          </p>
        ) : null}
      </form>

      {loading ? (
        <p className="status">Cargando...</p>
      ) : products.length === 0 ? (
        <p className="status">No hay productos.</p>
      ) : (
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
              {products.map((p) => (
                <tr key={p.id_product}>
                  <td className="mono">{p.id_product}</td>
                  <td>{p.name}</td>
                  <td className="mono">{p.unit_price.toFixed(2)}</td>
                  <td className="mono">{p.stock}</td>
                  <td>{categoryById.get(p.id_category)?.name ?? p.id_category}</td>
                  <td>{supplierById.get(p.id_supplier)?.name ?? p.id_supplier}</td>
                  <td className="right">
                    <div className="buttonRow compact">
                      <button
                        className="button"
                        type="button"
                        onClick={() => startEdit(p)}
                        disabled={saving}
                      >
                        Editar
                      </button>
                      <button
                        className="button danger"
                        type="button"
                        onClick={() => remove(p.id_product)}
                        disabled={saving}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
