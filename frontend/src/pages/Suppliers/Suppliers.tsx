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

export default function SuppliersPage() {
  const { apiBaseUrl } = useAppConfig()
  const queryClient = useQueryClient()
  
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', apiBaseUrl] })
      setEditingSupplier(null)
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

  return (
    <div>
      <PageHeader
              eyebrow="Catálogo"
              title="Proveedores"
              description="CRUD de proveedores"
              actions={
                <div className="buttonRow">
                  <button 
                    className="button primary" 
                    type="button" 
                    onClick={() => setEditingSupplier(null)} 
                    disabled={saving}
                  >
                    Nuevo proveedor
                  </button>
                </div>
              }
            />




      <SupplierForm 
        key={editingSupplier?.id_supplier ?? 'new'} 
        initialValues={editingSupplier} 
        saving={saving}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values)
        }}
        onCancel={() => setEditingSupplier(null)}
      />

      {isLoading ? <p>Cargando...</p> : null}
      {error ? <p>Error: {(error as Error).message}</p> : null}

      <SupplierTable 
        suppliers={suppliers} 
        saving={saving}
        onEdit={(supplier) => setEditingSupplier(supplier)} 
        onDelete={(id) => deleteMutation.mutate(id)} 
      />
    </div>
  )
}