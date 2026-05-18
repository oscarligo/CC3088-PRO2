### Ramas del Repositorio:

- Master: proyecto 2 de base de datos 1. 
- proyecto-3: proyecto 3 de base de datos 1. 
- proyecto-2-web: proyecto 2 de sistemas y tencnologías web


# CC3062 - Proyecto No 2. 

El proyecto consiste en diseñar y desarrollar una aplicación web para gestionar el inventario y las ventas de una tienda. 

## Contexto del negocio:

La tienda maneja productos agrupados en categorías, comprados a proveedores. Los clientes
realizan compras atendidas por empleados. Cada compra puede incluir varios productos y debe
quedar registrada junto con el detalle de lo vendido. La tienda necesita controlar el stock disponible

## Cómo correr (Docker)

### En la raiz del proyecto: 

1) Crear archivo de variables de entorno:

- Copiar `.env.example` a `.env` (se pueden dejar los valores por defecto).

2) Levantar tanto el backend como el frontend:

```bash
docker compose up --build
```

3) Abrir en el navegador:

- Frontend: http://localhost:5173 (por defecto)
- Backend API: http://localhost:8080 (por defecto)


## Estructura del Proyecto (Frontend)

```
src/
├── components/  # Componentes visuales reutilizables.
├── config/      # Configuraciones y constantes globales de la aplicación.
├── context/     # Manejo del estado global.
├── pages/       # Componentes contenedores de nivel de ruta.
├── schemas/     # Validaciones estrictas de Zod.
├── services/    # Llamadas HTTP directas a los endpoints del servidor.
├── types/       # Contratos y tipados estrictos de TypeScript.
├── utils/       # Funciones utilitarias auxiliares.
│
├── api.ts       # Cliente HTTP centralizado.
├── App.tsx      # Orquestador principal.
└── main.tsx     # Entrypoint
```

## Documentación de Endpoints


Base URL: `http://localhost:8080:/api` (si se dejan valores por defecto)


## Productos (Products)
- GET /api/products
  - Descripción: lista productos simples.
  - Respuesta 200: arreglo de `Product`.

- GET /api/products/inventory
  - Descripción: vista de inventario con nombre de categoría y proveedor.
  - Respuesta 200: arreglo de `InventoryProduct`.

- GET /api/products/{id}
  - Descripción: obtiene un producto por `id`.
  - Respuesta 200: `Product`.
  - Errores: 404 si no existe.

- POST /api/products
  - Descripción: crear producto.
  - Content-Type: `application/json`
  - Body JSON (CreateProductRequest):
    ```json
    {
      "name": "Producto",
      "unit_price": 12.5,
      "stock": 10,
      "id_category": 2,
      "id_supplier": 3
    }
    ```
  - Respuesta 201: objeto `Product` creado.
  - Errores: 400 para validación (nombre vacío, valores numéricos inválidos).

- PUT /api/products/{id}
  - Descripción: actualizar producto (mismo shape que CreateProductRequest via `UpdateProductRequest`).
  - Respuesta 200: objeto `Product` actualizado.
  - Errores: 404 si no existe, 400 si payload inválido.

- DELETE /api/products/{id}
  - Descripción: eliminar producto.
  - Respuesta 204 No Content en éxito.
  - Errores: 404 si no existe.

## Proveedores (Suppliers)
- GET /api/suppliers
  - Respuesta 200: arreglo de `Supplier`.

- GET /api/suppliers/{id}
  - Respuesta 200: `Supplier` o 404.

- POST /api/suppliers
  - Body JSON (CreateSupplierRequest):
    ```json
    {
      "name": "Proveedor SA",
      "email": "proveedor@example.com", 
      "phone": "1234 5678" 
    }
    ```
  - Respuesta 201: proveedor creado.

- PUT /api/suppliers/{id}
  - Actualiza proveedor; respuesta 200 con entidad actualizada.

- DELETE /api/suppliers/{id}
  - Respuesta 204 en éxito.
  - Errores: 409 Conflict si el proveedor tiene productos asociados; 404 si no existe.

## Categorías
- GET /api/categories
  - Respuesta 200: arreglo de categorías.

## Clientes
- GET /api/clients
  - Respuesta 200: arreglo de clientes.

## Empleados
- GET /api/employees
  - Respuesta 200: arreglo de empleados.

## Reportes
- GET /api/reports/sale-lines
  - Respuesta 200: listado de líneas de venta (detalle por venta).

- GET /api/reports/supplier-product-count?min_products=1
  - Query param: `min_products` (opcional, integer, >=0)
  - Respuesta 200: conteo de productos por proveedor.

- GET /api/reports/category-sales?min_total=0
  - Query param: `min_total` (opcional, number, >=0)
  - Respuesta 200: ventas agregadas por categoría.

- GET /api/reports/unsold-products
  - Respuesta 200: productos sin ventas.

- GET /api/reports/clients-min-sales?min_sales=2
  - Query param: `min_sales` (opcional, integer, >0)
  - Respuesta 200: clientes con al menos `min_sales` ventas.

- GET /api/reports/top-clients?limit=10
  - Query param: `limit` (opcional, integer 1..100)
  - Respuesta 200: top clientes.

## Ventas (Sales)
- POST /api/sales
  - Descripción: registra una venta.
  - Body JSON (CreateSaleRequest):
    ```json
    {
      "id_client": 5,           
      "id_employee": 2,        
      "items": [
        { "id_product": 12, "amount": 2 }
      ]
    }
    ```
  - Respuesta 201: `{ "id_sale": 123 }`.
  - Errores: 400 si `id_employee` inválido o si hay violaciones de inventario (el backend hace ROLLBACK y retorna error con mensaje)

## Formato de error
Todos los errores devuelven JSON con shape:
```json
{ "message": "Texto de error" }
```

