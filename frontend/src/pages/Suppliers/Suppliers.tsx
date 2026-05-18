import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppConfig } from '../../context/AppConfigContext/useAppConfig'
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../services/suppliersService'
import SupplierForm from '../../components/Suppliers/SupplierForm'
import SupplierTable from '../../components/Suppliers/SupplierTable'
import type { Supplier } from '../../types/domain'
import type { SupplierFormValues  } from '../../schemas/forms'
import './Suppliers.css'
import PageHeader from '../../components/PageHeader/PageHeader'
import StatusMessage from '../../components/StatusMessage/StatusMessage'

export default function SuppliersPage() {
  const { apiBaseUrl } = useAppConfig()
  const queryClient = useQueryClient()
  
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [formNonce, setFormNonce] = useState(0)

  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ['suppliers', apiBaseUrl],
    queryFn: () => getSuppliers(apiBaseUrl)
  })

  const saveMutation = useMutation({
    mutationFn: async (values: SupplierFormValues) => {
      const payload = {
        name: values.name.trim(),
        email: values.email.trim() || null,
        phone: values.phone.trim() || null,
      }
      if (editingSupplier != null) {
        return updateSupplier(apiBaseUrl, editingSupplier.id_supplier, payload)
      }
      return createSupplier(apiBaseUrl, payload)
    },
    onMutate: () => ({ wasEditing: editingSupplier != null }),
    onSuccess: (_data, _values, context) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', apiBaseUrl] })
      setEditingSupplier(null)

      // Si fue un CREATE (no un UPDATE), limpiamos el form
      if (!context?.wasEditing) {
        setFormNonce((current) => current + 1)
      }
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSupplier(apiBaseUrl, id),
    onSuccess: (_data, idEliminado) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', apiBaseUrl] })
      
      if (editingSupplier?.id_supplier === idEliminado) {
        setEditingSupplier(null)
      }
    }
  })

  const saving = saveMutation.isPending || deleteMutation.isPending
  const supplierFormKey = `${editingSupplier?.id_supplier ?? 'new'}-${formNonce}`

  return (
    <section className="page suppliersPage pageFrame section">
      <PageHeader
              eyebrow="Catálogo"
              title="Proveedores"
              description="CRUD de proveedores"
              actions={
                <div className="buttonRow">
                  <button 
                    className="button primary" 
                    type="button" 
                    onClick={() => {
                      setEditingSupplier(null)
                      setFormNonce((current) => current + 1)
                    }} 
                    disabled={saving}
                  >
                    Nuevo proveedor
                  </button>
                </div>
              }
            />

      <SupplierForm 
        key={supplierFormKey}
        initialValues={editingSupplier} 
        saving={saving}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values)
        }}
        onCancel={() => {
          setEditingSupplier(null)
          setFormNonce((current) => current + 1)
        }}
      />

      {isLoading ? (
        <StatusMessage kind="loading">Cargando proveedores...</StatusMessage>
      ) : error ? (
        <StatusMessage kind="error">Error: {(error as Error).message}</StatusMessage>
      ) : suppliers.length === 0 ? (
        <StatusMessage kind="empty">No hay proveedores.</StatusMessage>
      ) : (
        <SupplierTable 
          suppliers={suppliers} 
          saving={saving}
          onEdit={(supplier) => setEditingSupplier(supplier)} 
          onDelete={(id) => deleteMutation.mutate(id)} 
        />
      )}
    </section>
  )
}