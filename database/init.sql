-- 1. Tabla: product_category
CREATE TABLE product_category (
    id_category SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 2. Tabla: supplier
CREATE TABLE supplier (
    id_supplier SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20)
);

-- 3. Tabla: product
CREATE TABLE product (
    id_product SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    id_category INT NOT NULL,
    id_supplier INT NOT NULL,
    CONSTRAINT fk_product_category FOREIGN KEY (id_category) REFERENCES product_category(id_category),
    CONSTRAINT fk_product_supplier FOREIGN KEY (id_supplier) REFERENCES supplier(id_supplier)
);

-- 4. Tabla: employee
CREATE TABLE employee (
    id_employee SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- 5. Tabla: client
CREATE TABLE client (
    id_client SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    nit VARCHAR(20) NOT NULL,
    email VARCHAR(100)
);

-- 6. Tabla: sale
CREATE TABLE sale (
    id_sale SERIAL PRIMARY KEY,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_client INT NOT NULL,
    id_employee INT NOT NULL,
    CONSTRAINT fk_sale_client FOREIGN KEY (id_client) REFERENCES client(id_client),
    CONSTRAINT fk_sale_employee FOREIGN KEY (id_employee) REFERENCES employee(id_employee)
);

-- 7. Tabla: sale_details
CREATE TABLE sale_details (
    id_sale_detail SERIAL PRIMARY KEY,
    id_sale INT NOT NULL,
    id_product INT NOT NULL,
    amount INT NOT NULL,
    sale_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_detail_sale FOREIGN KEY (id_sale) REFERENCES sale(id_sale),
    CONSTRAINT fk_detail_product FOREIGN KEY (id_product) REFERENCES product(id_product)
);

-- ==========================================
-- CREACIÓN DE ÍNDICES (CREATE INDEX)
-- ==========================================

-- Acelera las búsquedas de clientes al facturar por NIT
CREATE INDEX idx_client_nit ON client(nit);

-- Optimiza la generación de reportes de ventas filtrados por fecha
CREATE INDEX idx_sale_date ON sale(date);

-- Mejora el rendimiento de los JOINs al buscar el detalle de una venta específica
CREATE INDEX idx_sale_details_sale ON sale_details(id_sale);