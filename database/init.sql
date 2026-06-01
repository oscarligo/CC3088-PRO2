-- ==========================================
-- Clean initialization script 
-- ==========================================
DROP TABLE IF EXISTS sale_details CASCADE;
DROP TABLE IF EXISTS sale CASCADE;
DROP TABLE IF EXISTS product CASCADE;
DROP TABLE IF EXISTS product_category CASCADE;
DROP TABLE IF EXISTS supplier CASCADE;
DROP TABLE IF EXISTS employee CASCADE;
DROP TABLE IF EXISTS client CASCADE;

-- ==========================================
-- 1. Product Category Table
-- ==========================================
CREATE TABLE product_category (
    id_category SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- ==========================================
-- 2. Supplier Table
-- ==========================================
CREATE TABLE supplier (
    id_supplier SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20)
);

-- ==========================================
-- 3. Product Table
-- ==========================================
CREATE TABLE product (
    id_product SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    stock INT NOT NULL CHECK (stock >= 0),
    id_category INT NOT NULL,
    id_supplier INT NOT NULL,
    CONSTRAINT fk_product_category FOREIGN KEY (id_category) REFERENCES product_category(id_category),
    CONSTRAINT fk_product_supplier FOREIGN KEY (id_supplier) REFERENCES supplier(id_supplier)
);

-- ==========================================
-- 4. Employee Table
-- ==========================================
CREATE TABLE employee (
    id_employee SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- ==========================================
-- 5. Client Table
-- ==========================================
CREATE TABLE client (
    id_client SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    nit VARCHAR(20) UNIQUE,
    email VARCHAR(100)
);

-- ==========================================
-- 6. Sale Table
-- ==========================================
CREATE TABLE sale (
    id_sale SERIAL PRIMARY KEY,
    sale_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_client INT,
    id_employee INT NOT NULL,
    total DECIMAL(12,2) DEFAULT 0 CHECK (total >= 0),

    CONSTRAINT fk_sale_client FOREIGN KEY (id_client) REFERENCES client(id_client),
    CONSTRAINT fk_sale_employee FOREIGN KEY (id_employee) REFERENCES employee(id_employee)
);

-- ==========================================
-- 7. Sale Details Table
-- ==========================================
CREATE TABLE sale_details (
    id_sale_detail SERIAL PRIMARY KEY,
    id_sale INT NOT NULL,
    id_product INT NOT NULL,
    amount INT NOT NULL CHECK (amount > 0),
    sale_price DECIMAL(10, 2) NOT NULL CHECK (sale_price >= 0),

    CONSTRAINT fk_detail_sale FOREIGN KEY (id_sale) REFERENCES sale(id_sale) ON DELETE CASCADE,
    CONSTRAINT fk_detail_product FOREIGN KEY (id_product) REFERENCES product(id_product),

    CONSTRAINT unique_sale_product UNIQUE (id_sale, id_product)
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_client_nit ON client(nit);
CREATE INDEX idx_sale_date ON sale(sale_date);
CREATE INDEX idx_sale_details_sale ON sale_details(id_sale);
CREATE INDEX idx_product_category ON product(id_category);
CREATE INDEX idx_product_supplier ON product(id_supplier);
CREATE INDEX idx_sale_employee ON sale(id_employee);

-- ==========================================
-- TRIGGER: UPDATE STOCK AFTER A SALE
-- ==========================================
CREATE OR REPLACE FUNCTION update_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE product
    SET stock = stock - NEW.amount
    WHERE id_product = NEW.id_product;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_stock
AFTER INSERT ON sale_details
FOR EACH ROW
EXECUTE FUNCTION update_stock();

-- ==========================================
-- TRIGGER: UPDATE SALE TOTAL AFTER INSERT/UPDATE/DELETE ON SALE DETAILS
-- ==========================================
CREATE OR REPLACE FUNCTION update_sale_total()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE sale
        SET total = (
            SELECT COALESCE(SUM(amount * sale_price), 0)
            FROM sale_details
            WHERE id_sale = OLD.id_sale
        )
        WHERE id_sale = OLD.id_sale;

        RETURN OLD;
    ELSE
        UPDATE sale
        SET total = (
            SELECT COALESCE(SUM(amount * sale_price), 0)
            FROM sale_details
            WHERE id_sale = NEW.id_sale
        )
        WHERE id_sale = NEW.id_sale;

        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_sale_total
AFTER INSERT OR UPDATE OR DELETE ON sale_details
FOR EACH ROW
EXECUTE FUNCTION update_sale_total();

-- ==========================================
-- VIEW: Inventory with Category and Supplier
-- Used by backend to feed the UI.
-- ==========================================
CREATE OR REPLACE VIEW vw_inventory AS
SELECT
    p.id_product,
    p.name AS product_name,
    p.unit_price,
    p.stock,
    p.id_category,
    c.name AS category_name,
    p.id_supplier,
    s.name AS supplier_name
FROM product p
INNER JOIN product_category c ON p.id_category = c.id_category
INNER JOIN supplier s ON p.id_supplier = s.id_supplier;


-- ============================================================================
-- 1. LIMPIEZA DE SEGURIDAD GENERAL
-- ============================================================================
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;

GRANT CONNECT ON DATABASE tienda_db TO PUBLIC;

-- ============================================================================
-- 2. CREACIÓN DE LOS 5 ROLES 
-- ============================================================================
DROP ROLE IF EXISTS role_admin;
DROP ROLE IF EXISTS role_cajero;
DROP ROLE IF EXISTS role_inventario;
DROP ROLE IF EXISTS role_analista;
DROP ROLE IF EXISTS role_soporte_auditor;

CREATE ROLE role_admin NOLOGIN;
CREATE ROLE role_cajero NOLOGIN;
CREATE ROLE role_inventario NOLOGIN;
CREATE ROLE role_analista NOLOGIN;
CREATE ROLE role_auditor NOLOGIN;

GRANT USAGE ON SCHEMA public TO role_admin, role_cajero, role_inventario, role_analista, role_auditor;


-- ============================================================================
-- 3. ASIGNACIÓN DE PERMISOS A LOS ROLES 
-- ============================================================================

-- --- A. ROLE_ADMIN (Control Total) ---
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO role_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO role_admin;

-- --- B. ROLE_CAJERO (Operaciones de Venta) ---
-- Puede registrar ventas y ver el historial
GRANT INSERT, SELECT ON sale, sale_details TO role_cajero;
GRANT USAGE, SELECT ON SEQUENCE sale_id_sale_seq, sale_details_id_sale_detail_seq TO role_cajero;
GRANT SELECT ON product, client, employee TO role_cajero;

-- --- C. ROLE_INVENTARIO (Administración de Stock) ---
GRANT SELECT, INSERT, UPDATE, DELETE ON product, product_category, supplier TO role_inventario;
GRANT USAGE, SELECT ON SEQUENCE product_id_product_seq, product_category_id_category_seq, supplier_id_supplier_seq TO role_inventario;
GRANT SELECT ON vw_inventory TO role_inventario;

-- --- D. ROLE_ANALISTA (Reportes) ---
-- Lectura estricta sobre el rendimiento comercial y catálogos de soporte
GRANT SELECT ON sale, sale_details, product, product_category, supplier, vw_inventory TO role_analista;

-- --- E. ROLE_AUDITOR (Cumplimiento Legal) ---
-- Solo lectura de la información de personas (Clientes y Empleados) para auditoría de datos o NITs
GRANT SELECT ON client, employee TO role_auditor;


-- ============================================================================
-- 4. CREACIÓN DE 5 USUARIOS DE PRUEBA (Cuentas con Acceso - LOGIN)
-- ============================================================================
DROP USER IF EXISTS user_master_admin;
DROP USER IF EXISTS user_cajero;
DROP USER IF EXISTS user_inventario;
DROP USER IF EXISTS user_analista;
DROP USER IF EXISTS user_auditor;

CREATE USER user_master_admin WITH PASSWORD '123456';
CREATE USER user_cajero  WITH PASSWORD '123456';
CREATE USER user_inventario WITH PASSWORD '123456';
CREATE USER user_analista     WITH PASSWORD '123456';
CREATE USER user_auditor WITH PASSWORD '123456';


-- ============================================================================
-- 5. ASIGNACIÓN DE ROLES A USUARIOS (GRANT ROLE TO USER)
-- ============================================================================
GRANT role_admin            TO user_master_admin;
GRANT role_cajero           TO user_cajero;
GRANT role_inventario       TO user_inventario;
GRANT role_analista         TO user_analista;
GRANT role_auditor          TO user_auditor;



-- ============================================================================
-- PROCEDIMIENTO 1: Registrar una Venta Completa de forma Transaccional
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_registrar_venta_transaccional(
    IN p_id_client INT,
    IN p_id_employee INT,
    IN p_id_product INT,
    IN p_amount INT,
    IN p_sale_price DECIMAL(10,2),
    OUT p_id_sale_generado INT,
    OUT p_codigo_estado VARCHAR(10),
    OUT p_mensaje_estado TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_stock_actual INT;
BEGIN
    -- 1. Validación de stock preventivo sobre la tabla 'product'
    SELECT stock INTO v_stock_actual FROM product WHERE id_product = p_id_product;
    
    IF v_stock_actual IS NULL THEN
        RAISE EXCEPTION 'El producto con ID % no existe.', p_id_product;
    END IF;

    IF v_stock_actual < p_amount THEN
        RAISE EXCEPTION 'Stock insuficiente. Disponible: %, Solicitado: %', v_stock_actual, p_amount;
    END IF;

    -- 2. Operación 1: Insertar Cabecera de Venta en la tabla 'sale'
    INSERT INTO sale (sale_date, id_client, id_employee, total)
    VALUES (CURRENT_TIMESTAMP, p_id_client, p_id_employee, 0)
    RETURNING id_sale INTO p_id_sale_generado;

    -- 3. Operación 2: Insertar Detalle en 'sale_details' (Dispara los triggers de stock y totales)
    INSERT INTO sale_details (id_sale, id_product, amount, sale_price)
    VALUES (p_id_sale_generado, p_id_product, p_amount, p_sale_price);

    p_codigo_estado := '201';
    p_mensaje_estado := 'Venta registrada con éxito de forma atómica.';

EXCEPTION
    WHEN OTHERS THEN
        -- Control absoluto de la transacción ante excepciones físicas o de triggers
        ROLLBACK;
        p_id_sale_generado := NULL;
        p_codigo_estado := '500';
        p_mensaje_estado := 'ROLLBACK ejecutado. Motivo del fallo: ' || SQLERRM;
END;
$$;


-- ============================================================================
-- PROCEDIMIENTO 2: Reporte analítico de productos más vendidos
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_reporte_top_productos(OUT p_json_resultado JSON)
LANGUAGE plpgsql AS $$
BEGIN
    SELECT json_agg(t) INTO p_json_resultado FROM (
        SELECT p.name, SUM(sd.amount) as total_vendido
        FROM sale_details sd
        JOIN product p ON sd.id_product = p.id_product
        GROUP BY p.name
        ORDER BY total_vendido DESC
        LIMIT 5
    ) t;
END;
$$;


-- ============================================================================
-- PROCEDIMIENTO 3: Reporte analítico de ventas por categoría
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_reporte_ventas_categoria(OUT p_json_resultado JSON)
LANGUAGE plpgsql AS $$
BEGIN
    SELECT json_agg(t) INTO p_json_resultado FROM (
        SELECT c.name as categoria, SUM(sd.amount * sd.sale_price) as ingresos
        FROM sale_details sd
        JOIN product p ON sd.id_product = p.id_product
        JOIN product_category c ON p.id_category = c.id_category
        GROUP BY c.name
    ) t;
END;
$$;


-- ============================================================================
-- PROCEDIMIENTO 4: Listar clientes con al menos 2 compras (SUBQUERY)
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_clientes_frecuentes(OUT p_json_resultado JSON)
LANGUAGE plpgsql AS $$
BEGIN
    SELECT json_agg(t) INTO p_json_resultado FROM (
        SELECT id_client, name, email FROM client
        WHERE id_client IN (
            SELECT id_client FROM sale 
            GROUP BY id_client 
            HAVING COUNT(id_sale) >= 2
        )
    ) t;
END;
$$;


-- ============================================================================
-- PROCEDIMIENTO 5: Productos sin ventas 
-- ============================================================================
CREATE OR REPLACE PROCEDURE sp_productos_sin_ventas(OUT p_json_resultado JSON)
LANGUAGE plpgsql AS $$
BEGIN
    SELECT json_agg(t) INTO p_json_resultado FROM (
        SELECT p.id_product, p.name FROM product p
        WHERE NOT EXISTS (
            SELECT 1 FROM sale_details sd WHERE sd.id_product = p.id_product
        )
    ) t;
END;
$$;