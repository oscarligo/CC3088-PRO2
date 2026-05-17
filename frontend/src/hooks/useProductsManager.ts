import { useEffect, useMemo, useReducer } from 'react'
import { useAppConfig } from '../context/AppConfigContext/useAppConfig'
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  getSuppliers,
  updateProduct,
} from '../services/productsService'
import type { Category, Product, Supplier } from '../types/domain'
import {
  decimalField,
  integerField,
  requiredText,
  validateWithSchema,
} from '../utils/validation'

export type ProductFormState = {
  name: string
  unitPrice: string
  stock: string
  idCategory: string
  idSupplier: string
}

export type ProductManagerState = {
  products: Product[]
  categories: Category[]
  suppliers: Supplier[]
  loading: boolean
  saving: boolean
  error: string | null
  formError: string | null
  editingId: number | null
  form: ProductFormState
}

type Action =
  | { type: 'loading'; value: boolean }
  | { type: 'saving'; value: boolean }
  | { type: 'error'; value: string | null }
  | { type: 'formError'; value: string | null }
  | { type: 'setData'; products: Product[]; categories: Category[]; suppliers: Supplier[] }
  | { type: 'setFormField'; field: keyof ProductFormState; value: string }
  | { type: 'setEditing'; value: number | null }
  | { type: 'resetForm'; defaults?: Partial<ProductFormState> }

const initialForm = {
  name: '',
  unitPrice: '',
  stock: '',
  idCategory: '',
  idSupplier: '',
}

const initialState: ProductManagerState = {
  products: [],
  categories: [],
  suppliers: [],
  loading: true,
  saving: false,
  error: null,
  formError: null,
  editingId: null,
  form: initialForm,
}

function reducer(state: ProductManagerState, action: Action): ProductManagerState {
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
      return {
        ...state,
        products: action.products,
        categories: action.categories,
        suppliers: action.suppliers,
      }
    case 'setFormField':
      return { ...state, form: { ...state.form, [action.field]: action.value } }
    case 'setEditing':
      return { ...state, editingId: action.value }
    case 'resetForm':
      return {
        ...state,
        editingId: null,
        formError: null,
        form: {
          ...initialForm,
          ...action.defaults,
        },
      }
    default:
      return state
  }
}

export function useProductsManager() {
  const { apiBaseUrl } = useAppConfig()
  const [state, dispatch] = useReducer(reducer, initialState)

  const categoryById = useMemo(() => {
    const map = new Map<number, Category>()
    for (const category of state.categories) map.set(category.id_category, category)
    return map
  }, [state.categories])

  const supplierById = useMemo(() => {
    const map = new Map<number, Supplier>()
    for (const supplier of state.suppliers) map.set(supplier.id_supplier, supplier)
    return map
  }, [state.suppliers])

  const reload = async (signal?: AbortSignal) => {
    const [products, categories, suppliers] = await Promise.all([
      getProducts(apiBaseUrl, signal),
      getCategories(apiBaseUrl, signal),
      getSuppliers(apiBaseUrl, signal),
    ])

    dispatch({ type: 'setData', products, categories, suppliers })

    if (!state.form.idCategory && categories.length > 0) {
      dispatch({ type: 'setFormField', field: 'idCategory', value: String(categories[0].id_category) })
    }

    if (!state.form.idSupplier && suppliers.length > 0) {
      dispatch({ type: 'setFormField', field: 'idSupplier', value: String(suppliers[0].id_supplier) })
    }
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

  const startCreate = () => {
    dispatch({ type: 'resetForm', defaults: {
      idCategory: state.categories[0] ? String(state.categories[0].id_category) : '',
      idSupplier: state.suppliers[0] ? String(state.suppliers[0].id_supplier) : '',
    } })
  }

  const startEdit = (product: Product) => {
    dispatch({ type: 'setEditing', value: product.id_product })
    dispatch({ type: 'formError', value: null })
    dispatch({ type: 'setFormField', field: 'name', value: product.name })
    dispatch({ type: 'setFormField', field: 'unitPrice', value: String(product.unit_price) })
    dispatch({ type: 'setFormField', field: 'stock', value: String(product.stock) })
    dispatch({ type: 'setFormField', field: 'idCategory', value: String(product.id_category) })
    dispatch({ type: 'setFormField', field: 'idSupplier', value: String(product.id_supplier) })
  }

  const setField = (field: keyof ProductFormState, value: string) => {
    dispatch({ type: 'setFormField', field, value })
  }

  const resetForm = () => {
    dispatch({
      type: 'resetForm',
      defaults: {
        idCategory: state.categories[0] ? String(state.categories[0].id_category) : '',
        idSupplier: state.suppliers[0] ? String(state.suppliers[0].id_supplier) : '',
      },
    })
  }

  const submit = async () => {
    dispatch({ type: 'formError', value: null })

    const formErrors = validateWithSchema(state.form, {
      name: requiredText('El nombre es obligatorio'),
      unitPrice: decimalField('El precio debe ser un número mayor o igual a 0', { min: 0 }),
      stock: integerField('El stock debe ser un entero mayor o igual a 0', { min: 0 }),
      idCategory: integerField('Selecciona una categoría válida', { min: 1 }),
      idSupplier: integerField('Selecciona un proveedor válido', { min: 1 }),
    })

    if (Object.keys(formErrors).length > 0) {
      dispatch({ type: 'formError', value: Object.values(formErrors)[0] ?? 'Revisa los campos' })
      return false
    }

    const payload = {
      name: state.form.name.trim(),
      unit_price: Number(state.form.unitPrice),
      stock: Number(state.form.stock),
      id_category: Number(state.form.idCategory),
      id_supplier: Number(state.form.idSupplier),
    }

    dispatch({ type: 'saving', value: true })
    dispatch({ type: 'error', value: null })

    try {
      if (state.editingId != null) {
        await updateProduct(apiBaseUrl, state.editingId, payload)
      } else {
        await createProduct(apiBaseUrl, payload)
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
      await deleteProduct(apiBaseUrl, id)
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
    categoryById,
    supplierById,
    setField,
    startCreate,
    startEdit,
    resetForm,
    submit,
    remove,
    reload,
  }
}
