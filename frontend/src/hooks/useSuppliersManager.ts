import { useEffect, useReducer } from 'react'
import { useAppConfig } from '../context/AppConfigContext/useAppConfig'
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from '../services/suppliersService'
import type { Supplier } from '../types/domain'
import { optionalEmail, optionalPhone, requiredText, validateWithSchema } from '../utils/validation'

export type SupplierFormState = {
  name: string
  email: string
  phone: string
}

export type SupplierManagerState = {
  suppliers: Supplier[]
  loading: boolean
  saving: boolean
  error: string | null
  formError: string | null
  editingId: number | null
  form: SupplierFormState
}

type Action =
  | { type: 'loading'; value: boolean }
  | { type: 'saving'; value: boolean }
  | { type: 'error'; value: string | null }
  | { type: 'formError'; value: string | null }
  | { type: 'setData'; suppliers: Supplier[] }
  | { type: 'setFormField'; field: keyof SupplierFormState; value: string }
  | { type: 'setEditing'; value: number | null }
  | { type: 'resetForm' }

const initialForm = {
  name: '',
  email: '',
  phone: '',
}

const initialState: SupplierManagerState = {
  suppliers: [],
  loading: true,
  saving: false,
  error: null,
  formError: null,
  editingId: null,
  form: initialForm,
}

function reducer(state: SupplierManagerState, action: Action): SupplierManagerState {
  switch (action.type) {
    case 'loading':
      return { ...state, loading: action.value }
    case 'saving':
      return { ...state, saving: action.value }
    case 'error':
      return { ...state, error: action.value }
    case 'formError':
      return { ...state, formError: action.value }
    case 'setData':
      return { ...state, suppliers: action.suppliers }
    case 'setFormField':
      return { ...state, form: { ...state.form, [action.field]: action.value } }
    case 'setEditing':
      return { ...state, editingId: action.value }
    case 'resetForm':
      return { ...state, editingId: null, formError: null, form: initialForm }
    default:
      return state
  }
}

export function useSuppliersManager() {
  const { apiBaseUrl } = useAppConfig()
  const [state, dispatch] = useReducer(reducer, initialState)

  const reload = async (signal?: AbortSignal) => {
    const suppliers = await getSuppliers(apiBaseUrl, signal)
    dispatch({ type: 'setData', suppliers })
  }

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      dispatch({ type: 'loading', value: true })
      dispatch({ type: 'error', value: null })

      try {
        await reload(controller.signal)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        dispatch({ type: 'error', value: error instanceof Error ? error.message : 'Error desconocido' })
      } finally {
        dispatch({ type: 'loading', value: false })
      }
    }

    void load()

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBaseUrl])

  const setField = (field: keyof SupplierFormState, value: string) => {
    dispatch({ type: 'setFormField', field, value })
  }

  const startEdit = (supplier: Supplier) => {
    dispatch({ type: 'setEditing', value: supplier.id_supplier })
    dispatch({ type: 'formError', value: null })
    dispatch({ type: 'setFormField', field: 'name', value: supplier.name })
    dispatch({ type: 'setFormField', field: 'email', value: supplier.email ?? '' })
    dispatch({ type: 'setFormField', field: 'phone', value: supplier.phone ?? '' })
  }

  const resetForm = () => dispatch({ type: 'resetForm' })

  const submit = async () => {
    dispatch({ type: 'formError', value: null })

    const formErrors = validateWithSchema(state.form, {
      name: requiredText('El nombre es obligatorio'),
      email: optionalEmail('Ingresa un correo válido o deja el campo vacío'),
      phone: optionalPhone('Ingresa un teléfono válido o deja el campo vacío'),
    })

    if (Object.keys(formErrors).length > 0) {
      dispatch({ type: 'formError', value: Object.values(formErrors)[0] ?? 'Revisa los campos' })
      return false
    }

    const payload = {
      name: state.form.name.trim(),
      email: state.form.email.trim() ? state.form.email.trim() : null,
      phone: state.form.phone.trim() ? state.form.phone.trim() : null,
    }

    dispatch({ type: 'saving', value: true })
    dispatch({ type: 'error', value: null })

    try {
      if (state.editingId != null) {
        await updateSupplier(apiBaseUrl, state.editingId, payload)
      } else {
        await createSupplier(apiBaseUrl, payload)
      }

      await reload()
      resetForm()
      return true
    } catch (error) {
      dispatch({ type: 'error', value: error instanceof Error ? error.message : 'Error desconocido' })
      return false
    } finally {
      dispatch({ type: 'saving', value: false })
    }
  }

  const remove = async (id: number) => {
    dispatch({ type: 'saving', value: true })
    dispatch({ type: 'error', value: null })

    try {
      await deleteSupplier(apiBaseUrl, id)
      await reload()
      if (state.editingId === id) resetForm()
    } catch (error) {
      dispatch({ type: 'error', value: error instanceof Error ? error.message : 'Error desconocido' })
    } finally {
      dispatch({ type: 'saving', value: false })
    }
  }

  return {
    state,
    setField,
    startEdit,
    resetForm,
    submit,
    remove,
    reload,
  }
}
