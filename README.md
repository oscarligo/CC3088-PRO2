### Ramas del Repositorio:

- Master: proyecto 2 de base de datos 1. 
- proyecto-3: proyecto 3 de base de datos 1. 

# CC3088 - Proyecto No 3. 

El proyecto consiste en diseñar y desarrollar una aplicación web para gestionar el inventario y las ventas de una tienda. Trabajando sobre el proyecto número 2.  

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
- Backend API: http://localhost:8081 (por defecto)


## Estructura del proyecto: 
```
src/
├─ handlers/       			 // Controladores
│  ├─ mod.rs
│  └─ *_handler.rs  (product, sale, report, etc.)
├─ models/          		 // ENTIDADES Y DTOs con SeaORM
│  ├─ mod.rs
│  └─ *.rs          (product, report, sale, etc.)
├─ repository/      		 // Interacción con la DB
│  ├─ [entidad]/    		 // Subcarpetas por entidad
│  │  ├─ mod.rs
│  │  ├─ repository.rs       // Trait/Interface: Define QUÉ hace
│  │  └─ repository_impl.rs  // Implementación: Define CÓMO lo hace con el ORM
│  └─ mod.rs
└─ main.rs          		 // Configuración, base de datos y Server HTTP

```


## Requisitos del proyecto (dónde se ve en la UI)

- CRUD de 2 entidades:
	- Productos: pestaña **Productos (CRUD)** (tabla `product`).
	- Proveedores: pestaña **Proveedores (CRUD)** (tabla `supplier`).

- VIEW usado por el backend:
	- El inventario usa el VIEW `vw_inventory` y se muestra en **Inventario (VIEW)**.

- Consultas visibles en la UI (ejecutadas desde la app web):
	- JOIN multi-tabla: **Detalle de ventas**, **Productos por proveedor**, **Ventas por categoría** (pestaña **Reportes SQL**).
	- SUBQUERY: **Productos sin ventas (NOT EXISTS)** y **Clientes con al menos 2 ventas (IN)** (pestaña **Reportes SQL**).
	- GROUP BY + HAVING + agregación: **Productos por proveedor** y **Ventas por categoría** (pestaña **Reportes SQL**).
	- CTE (WITH): **Top clientes por gasto** (pestaña **Reportes SQL**).
	- Transacción explícita con ROLLBACK: **Registrar venta** (pestaña **Reportes SQL**). Si se ingresa una cantidad mayor al stock, el backend responde error y hace rollback.

## Stored procedures utilizados

Los procedimientos se crean en `database/init.sql`, el backend los ejecuta con `CALL ...` desde los repositorios, y el frontend solo consume los resultados a través de la API.

| Procedure | Qué hace | Dónde se usa en backend | Endpoint/API | Dónde se ve en frontend |
| --- | --- | --- | --- | --- |
| `sp_registrar_venta_transaccional` | Registra una venta, valida stock y deja que los triggers actualicen stock y total. | `backend/src/repository/sale/repository_impl.rs` en `create_sale()` | `POST /api/sales` vía `backend/src/handlers/sale_handler.rs` | Formulario **Registrar venta** en `frontend/src/screens/ReportsScreen.tsx` |
| `sp_reporte_top_productos` | Devuelve en JSON los productos más vendidos. | `backend/src/repository/report/repository_impl.rs` en `top_clients()` | `GET /api/reports/top-clients` vía `backend/src/handlers/report_handler.rs` | Tarjeta **Top clientes por gasto** en `frontend/src/screens/ReportsScreen.tsx` | 
| `sp_reporte_ventas_categoria` | Devuelve en JSON el total vendido por categoría. | `backend/src/repository/report/repository_impl.rs` en `category_sales()` | `GET /api/reports/category-sales` vía `backend/src/handlers/report_handler.rs` | Tarjeta **Ventas por categoría** en `frontend/src/screens/ReportsScreen.tsx` |
| `sp_clientes_frecuentes` | Devuelve en JSON los clientes con al menos 2 compras. | `backend/src/repository/report/repository_impl.rs` en `clients_with_min_sales()` | `GET /api/reports/clients-min-sales` vía `backend/src/handlers/report_handler.rs` | Tarjeta **Clientes con al menos 2 ventas** en `frontend/src/screens/ReportsScreen.tsx` | 
| `sp_productos_sin_ventas` | Devuelve en JSON los productos que no aparecen en `sale_details`. | `backend/src/repository/report/repository_impl.rs` en `unsold_products()` | `GET /api/reports/unsold-products` vía `backend/src/handlers/report_handler.rs` | Tarjeta **Productos sin ventas** en `frontend/src/screens/ReportsScreen.tsx` | 

## Roles y seguridad

La aplicación usa dos capas relacionadas, pero no idénticas:

1. Roles y usuarios de PostgreSQL creados en `database/init.sql`.
2. Roles de aplicación (`AppRole`) mapeados en `backend/src/auth.rs` y reflejados en `frontend/src/auth.ts` y `frontend/src/App.tsx`.

### Flujo real de uso de roles

1. El login entra por `POST /api/auth/login` en `backend/src/handlers/auth_handler.rs`.
2. `backend/src/auth.rs` valida que el usuario sea uno de los permitidos (`user_master_admin`, `user_cajero`, etc.) y prueba las credenciales intentando abrir una conexión PostgreSQL con ese usuario.
3. Si el login funciona, el backend emite un JWT con el `AppRole`.
4. Cada handler protege sus endpoints con `extract_session(...)`.
5. Las consultas normales de la app usan la conexión compartida creada en `backend/src/main.rs` desde `DATABASE_URL`; por eso, en tiempo de ejecución la autorización principal la hace el backend con JWT/roles de aplicación, no un cambio de usuario SQL por request.

### Matriz de roles

| Rol SQL | Usuario de prueba | Permisos definidos en SQL | Uso en backend | Uso en frontend |
| --- | --- | --- | --- | --- |
| `role_admin` | `user_master_admin` | `ALL PRIVILEGES` sobre tablas y secuencias del esquema `public`. | `AppRole::Admin` en `backend/src/auth.rs`. `extract_session(...)` le da acceso total a todos los handlers. | Ve las pestañas `Inventario`, `Productos`, `Proveedores` y `Reportes` en `frontend/src/App.tsx`. También puede usar el formulario **Registrar venta** en `ReportsScreen`. |
| `role_cajero` | `user_cajero` | `INSERT` y `SELECT` sobre `sale` y `sale_details`; `SELECT` sobre `product`, `client` y `employee`. | `AppRole::Cajero` puede entrar a `POST /api/sales`, `GET /api/clients` y `GET /api/employees`. | Ve la pestaña `reportes` |
| `role_inventario` | `user_inventario` | CRUD sobre `product`, `product_category` y `supplier`; lectura de `vw_inventory`. | `AppRole::Inventario` puede usar inventario, productos, proveedores y categorías desde sus handlers. | Ve las pestañas `Inventario`, `Productos` y `Proveedores`. |
| `role_analista` | `user_analista` | `SELECT` sobre ventas, productos, categorías, proveedores y `vw_inventory`. | `AppRole::Analista` puede consumir todos los endpoints de `/api/reports/*` y consultas de lectura de inventario/catálogo. | Ve las pestañas `Inventario` y `Reportes`. |
| `role_auditor` | `user_auditor` | `SELECT` sobre `client` y `employee`. | `AppRole::Auditor` puede entrar a `GET /api/clients` y `GET /api/employees`. | Ve las pestañas `inventario`, `reportes` y `productos` |

### Handlers protegidos por rol

- `backend/src/handlers/product_handler.rs`: `Inventario`, `Analista` para lectura; solo `Inventario` para crear/editar/eliminar.
- `backend/src/handlers/supplier_handler.rs`: `Inventario`, `Analista` para lectura; solo `Inventario` para crear/editar/eliminar.
- `backend/src/handlers/category_handler.rs`: `Inventario` y `Analista`.
- `backend/src/handlers/report_handler.rs`: `Analista`; `Admin` también entra por bypass global.
- `backend/src/handlers/sale_handler.rs`: `Cajero`; `Admin` también entra por bypass global.
- `backend/src/handlers/client_handler.rs`: `Cajero` y `Auditor`.
- `backend/src/handlers/employee_handler.rs`: `Cajero` y `Auditor`.
