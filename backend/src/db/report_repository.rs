use sqlx::PgPool;

use crate::models::client::Client;
use crate::models::product::InventoryProduct;
use crate::models::report::{CategorySales, SaleLine, SupplierProductCount, TopClient};

pub async fn list_sale_lines(pool: &PgPool) -> Result<Vec<SaleLine>, sqlx::Error> {
    sqlx::query_as::<_, SaleLine>(
        r#"
        SELECT
            s.id_sale,
            s.date::text AS sale_date,
            c.name AS client_name,
            e.name AS employee_name,
            p.name AS product_name,
            sd.amount,
            sd.sale_price::float8 AS sale_price,
            (sd.amount * sd.sale_price)::float8 AS line_total
        FROM sale s
        INNER JOIN sale_details sd ON sd.id_sale = s.id_sale
        INNER JOIN product p ON p.id_product = sd.id_product
        LEFT JOIN client c ON c.id_client = s.id_client
        INNER JOIN employee e ON e.id_employee = s.id_employee
        ORDER BY s.id_sale, sd.id_sale_detail
        "#,
    )
    .fetch_all(pool)
    .await
}

pub async fn supplier_product_count(
    pool: &PgPool,
    min_products: i64,
) -> Result<Vec<SupplierProductCount>, sqlx::Error> {
    sqlx::query_as::<_, SupplierProductCount>(
        r#"
        SELECT
            s.id_supplier,
            s.name AS supplier_name,
            COUNT(p.id_product) AS products_count,
            AVG(p.unit_price)::float8 AS avg_unit_price
        FROM supplier s
        LEFT JOIN product p ON p.id_supplier = s.id_supplier
        GROUP BY s.id_supplier, s.name
        HAVING COUNT(p.id_product) >= $1
        ORDER BY products_count DESC, supplier_name
        "#,
    )
    .bind(min_products)
    .fetch_all(pool)
    .await
}

pub async fn category_sales(pool: &PgPool, min_total: f64) -> Result<Vec<CategorySales>, sqlx::Error> {
    sqlx::query_as::<_, CategorySales>(
        r#"
        SELECT
            c.id_category,
            c.name AS category_name,
            SUM(sd.amount)::bigint AS items_sold,
            COUNT(DISTINCT s.id_sale) AS sales_count,
            SUM(sd.amount * sd.sale_price)::float8 AS total_revenue
        FROM product_category c
        INNER JOIN product p ON p.id_category = c.id_category
        INNER JOIN sale_details sd ON sd.id_product = p.id_product
        INNER JOIN sale s ON s.id_sale = sd.id_sale
        GROUP BY c.id_category, c.name
        HAVING SUM(sd.amount * sd.sale_price) >= $1
        ORDER BY total_revenue DESC
        "#,
    )
    .bind(min_total)
    .fetch_all(pool)
    .await
}

pub async fn unsold_products(pool: &PgPool) -> Result<Vec<InventoryProduct>, sqlx::Error> {
    sqlx::query_as::<_, InventoryProduct>(
        r#"
        SELECT
            inv.id_product,
            inv.product_name,
            inv.unit_price::float8 AS unit_price,
            inv.stock,
            inv.category_name,
            inv.supplier_name
        FROM vw_inventory inv
        WHERE NOT EXISTS (
            SELECT 1
            FROM sale_details sd
            WHERE sd.id_product = inv.id_product
        )
        ORDER BY inv.id_product
        "#,
    )
    .fetch_all(pool)
    .await
}

pub async fn clients_with_min_sales(pool: &PgPool, min_sales: i64) -> Result<Vec<Client>, sqlx::Error> {
    sqlx::query_as::<_, Client>(
        r#"
        SELECT c.id_client, c.name, c.nit, c.email
        FROM client c
        WHERE c.id_client IN (
            SELECT s.id_client
            FROM sale s
            WHERE s.id_client IS NOT NULL
            GROUP BY s.id_client
            HAVING COUNT(*) >= $1
        )
        ORDER BY c.id_client
        "#,
    )
    .bind(min_sales)
    .fetch_all(pool)
    .await
}

pub async fn top_clients(pool: &PgPool, limit: i64) -> Result<Vec<TopClient>, sqlx::Error> {
    sqlx::query_as::<_, TopClient>(
        r#"
        WITH sales_by_client AS (
            SELECT
                c.id_client,
                c.name AS client_name,
                SUM(sd.amount * sd.sale_price)::float8 AS total_spent,
                COUNT(DISTINCT s.id_sale) AS sales_count
            FROM client c
            INNER JOIN sale s ON s.id_client = c.id_client
            INNER JOIN sale_details sd ON sd.id_sale = s.id_sale
            GROUP BY c.id_client, c.name
        )
        SELECT id_client, client_name, total_spent, sales_count
        FROM sales_by_client
        ORDER BY total_spent DESC
        LIMIT $1
        "#,
    )
    .bind(limit)
    .fetch_all(pool)
    .await
}
