import { useEffect, useState, type FormEvent } from 'react'
import { apiJson, apiNoContent } from '../../api'

type Supplier = {
  id_supplier: number
  name: string
  email: string | null
  phone: string | null
}

type Props = {
  apiBaseUrl: string
}

export default function SuppliersScreen({ apiBaseUrl }: Props) {
  const suppliersUrl = `${apiBaseUrl}/api/suppliers`

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setEmail('')
    setPhone('')
    setFormError(null)
  }

  const reload = async (signal?: AbortSignal) => {
    const data = await apiJson<Supplier[]>(suppliersUrl, { signal })
    setSuppliers(data)
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
  }, [suppliersUrl])

  const startEdit = (s: Supplier) => {
    setEditingId(s.id_supplier)
    setName(s.name)
    setEmail(s.email ?? '')
    setPhone(s.phone ?? '')
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

    setSaving(true)
    setError(null)

    const body = JSON.stringify({
      name: trimmedName,
      email: email.trim() ? email.trim() : null,
      phone: phone.trim() ? phone.trim() : null,
    })

    try {
      if (editingId) {
        await apiJson<Supplier>(`${suppliersUrl}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body,
        })
      } else {
        await apiJson<Supplier>(suppliersUrl, {
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
    setSaving(true)
    setError(null)

    try {
      await apiNoContent(`${suppliersUrl}/${id}`, { method: 'DELETE' })
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
        <h2>Proveedores (CRUD)</h2>
        <p className="muted">CRUD completo sobre la tabla <code>supplier</code>.</p>
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
              placeholder="Nombre del proveedor"
              disabled={saving}
              required
            />
          </label>

          <label className="field">
            <span className="label">Email</span>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@dominio.com"
              disabled={saving}
            />
          </label>

          <label className="field">
            <span className="label">Teléfono</span>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0000-0000"
              disabled={saving}
            />
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
      ) : suppliers.length === 0 ? (
        <p className="status">No hay proveedores.</p>
      ) : (
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
              {suppliers.map((s) => (
                <tr key={s.id_supplier}>
                  <td className="mono">{s.id_supplier}</td>
                  <td>{s.name}</td>
                  <td className="mono">{s.email ?? '-'}</td>
                  <td className="mono">{s.phone ?? '-'}</td>
                  <td className="right">
                    <div className="buttonRow compact">
                      <button
                        className="button"
                        type="button"
                        onClick={() => startEdit(s)}
                        disabled={saving}
                      >
                        Editar
                      </button>
                      <button
                        className="button danger"
                        type="button"
                        onClick={() => remove(s.id_supplier)}
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
