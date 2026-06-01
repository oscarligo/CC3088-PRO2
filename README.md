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
