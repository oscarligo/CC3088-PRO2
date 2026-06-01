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