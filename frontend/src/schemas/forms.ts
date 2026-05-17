import { z } from 'zod'

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  unitPrice: z
    .string()
    .trim()
    .min(1, 'El precio es obligatorio')
    .refine((value) => Number.isFinite(Number(value)), 'El precio debe ser un número válido')
    .refine((value) => Number(value) >= 0, 'El precio debe ser un número mayor o igual a 0'),
  stock: z
    .string()
    .trim()
    .min(1, 'El stock es obligatorio')
    .refine((value) => /^\d+$/.test(value), 'El stock debe ser un entero válido')
    .refine((value) => Number(value) >= 0, 'El stock debe ser un entero mayor o igual a 0'),
  idCategory: z
    .string()
    .trim()
    .min(1, 'Selecciona una categoría válida')
    .refine((value) => /^\d+$/.test(value) && Number(value) > 0, 'Selecciona una categoría válida'),
  idSupplier: z
    .string()
    .trim()
    .min(1, 'Selecciona un proveedor válido')
    .refine((value) => /^\d+$/.test(value) && Number(value) > 0, 'Selecciona un proveedor válido'),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

export const supplierFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  email: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\S+@\S+\.\S+$/.test(value), 'Ingresa un correo válido o deja el campo vacío'),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || /^[0-9+\-\s()]{5,}$/.test(value), 'Ingresa un teléfono válido o deja el campo vacío'),
})

export type SupplierFormValues = z.infer<typeof supplierFormSchema>

export const saleFormSchema = z.object({
  idClient: z.string().trim().optional(),
  idEmployee: z
    .string()
    .trim()
    .min(1, 'Selecciona un empleado válido')
    .refine((value) => /^\d+$/.test(value) && Number(value) > 0, 'Selecciona un empleado válido'),
  idProduct: z
    .string()
    .trim()
    .min(1, 'Selecciona un producto válido')
    .refine((value) => /^\d+$/.test(value) && Number(value) > 0, 'Selecciona un producto válido'),
  amount: z
    .string()
    .trim()
    .min(1, 'La cantidad es obligatoria')
    .refine((value) => /^\d+$/.test(value), 'La cantidad debe ser un entero > 0')
    .refine((value) => Number(value) > 0, 'La cantidad debe ser un entero > 0'),
})

export type SaleFormValues = z.infer<typeof saleFormSchema>
