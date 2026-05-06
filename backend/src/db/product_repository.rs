use sqlx::PgPool;
use crate::models::product::{CreateProductRequest, InventoryProduct, Product, UpdateProductRequest};

/*
Retrieves a list of all products in the inventory with their associated category and supplier information.
 */

pub async fn get_inventory(pool: &PgPool) -> Result<Vec<InventoryProduct>, sqlx::Error> {
    let products: Vec<InventoryProduct> = sqlx::query_as::<_, InventoryProduct>(
        r#"
        SELECT
            id_product,
            product_name,
            unit_price::float8 AS unit_price,
            stock,
            category_name,
            supplier_name
        FROM vw_inventory
        ORDER BY id_product
        "#,
    )
    .fetch_all(pool)
    .await?;

    Ok(products)
}

pub async fn list_products(pool: &PgPool) -> Result<Vec<Product>, sqlx::Error> {
    sqlx::query_as::<_, Product>(
        r#"
        SELECT
            id_product,
            name,
            unit_price::float8 AS unit_price,
            stock,
            id_category,
            id_supplier
        FROM product
        ORDER BY id_product
        "#,
    )
    .fetch_all(pool)
    .await
}

pub async fn get_product(pool: &PgPool, id_product: i32) -> Result<Option<Product>, sqlx::Error> {
    sqlx::query_as::<_, Product>(
        r#"
        SELECT
            id_product,
            name,
            unit_price::float8 AS unit_price,
            stock,
            id_category,
            id_supplier
        FROM product
        WHERE id_product = $1
        "#,
    )
    .bind(id_product)
    .fetch_optional(pool)
    .await
}

pub async fn create_product(
    pool: &PgPool,
    payload: &CreateProductRequest,
) -> Result<Product, sqlx::Error> {
    sqlx::query_as::<_, Product>(
        r#"
        INSERT INTO product (name, unit_price, stock, id_category, id_supplier)
        VALUES ($1, $2::numeric, $3, $4, $5)
        RETURNING
            id_product,
            name,
            unit_price::float8 AS unit_price,
            stock,
            id_category,
            id_supplier
        "#,
    )
    .bind(&payload.name)
    .bind(payload.unit_price)
    .bind(payload.stock)
    .bind(payload.id_category)
    .bind(payload.id_supplier)
    .fetch_one(pool)
    .await
}

pub async fn update_product(
    pool: &PgPool,
    id_product: i32,
    payload: &UpdateProductRequest,
) -> Result<Option<Product>, sqlx::Error> {
    sqlx::query_as::<_, Product>(
        r#"
        UPDATE product
        SET
            name = $1,
            unit_price = $2::numeric,
            stock = $3,
            id_category = $4,
            id_supplier = $5
        WHERE id_product = $6
        RETURNING
            id_product,
            name,
            unit_price::float8 AS unit_price,
            stock,
            id_category,
            id_supplier
        "#,
    )
    .bind(&payload.name)
    .bind(payload.unit_price)
    .bind(payload.stock)
    .bind(payload.id_category)
    .bind(payload.id_supplier)
    .bind(id_product)
    .fetch_optional(pool)
    .await
}

pub async fn delete_product(pool: &PgPool, id_product: i32) -> Result<u64, sqlx::Error> {
    let result = sqlx::query(
        r#"
        DELETE FROM product
        WHERE id_product = $1
        "#,
    )
    .bind(id_product)
    .execute(pool)
    .await?;

    Ok(result.rows_affected())
}