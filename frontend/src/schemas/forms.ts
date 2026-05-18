import { z } from 'zod'

// ==========================================
// 1. PRODUCT FORM SCHEMA
// ==========================================
export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  unitPrice: z.coerce
    .number({ message: 'El precio debe ser un número válido' })
    .min(0, 'El precio debe ser un número mayor o igual a 0'),
  stock: z.coerce
    .number({ message: 'El stock debe ser un número válido' })
    .int('El stock debe ser un número entero')
    .min(0, 'El stock debe ser mayor o igual a 0'),
  idCategory: z.coerce
    .number({ message: 'Selecciona una categoría válida' })
    .int()
    .positive('Selecciona una categoría válida'),
  idSupplier: z.coerce
    .number({ message: 'Selecciona un proveedor válido' })
    .int()
    .positive('Selecciona un proveedor válido'),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

// ==========================================
// 2. SUPPLIER FORM SCHEMA
// ==========================================
export const supplierFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  email: z
    .string()
    .trim()
    .email('Ingresa un correo válido')
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{5,}$/, 'Ingresa un teléfono válido')
    .or(z.literal('')),
})

export type SupplierFormValues = z.infer<typeof supplierFormSchema>

// ==========================================
// 3. SALE FORM SCHEMA
// ==========================================
export const saleFormSchema = z.object({
  idClient: z.string().trim().optional().or(z.literal('')),
  idEmployee: z.coerce
    .number({ message: 'Selecciona un empleado válido' })
    .int()
    .positive('Selecciona un empleado válido'),
  idProduct: z.coerce
    .number({ message: 'Selecciona un producto válido' })
    .int()
    .positive('Selecciona un producto válido'),
  amount: z.coerce
    .number({ message: 'La cantidad debe ser un número válido' })
    .int('La cantidad debe ser un número entero')
    .positive('La cantidad debe ser mayor a 0'),
})

export type SaleFormValues = z.infer<typeof saleFormSchema>