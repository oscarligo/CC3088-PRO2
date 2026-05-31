use sqlx::PgPool;

use crate::models::supplier::{CreateSupplierRequest, Supplier, UpdateSupplierRequest};

pub async fn list_suppliers(pool: &PgPool) -> Result<Vec<Supplier>, sqlx::Error> {
    sqlx::query_as::<_, Supplier>(
        r#"
        SELECT id_supplier, name, email, phone
        FROM supplier
        ORDER BY id_supplier
        "#,
    )
    .fetch_all(pool)
    .await
}

pub async fn get_supplier(pool: &PgPool, id_supplier: i32) -> Result<Option<Supplier>, sqlx::Error> {
    sqlx::query_as::<_, Supplier>(
        r#"
        SELECT id_supplier, name, email, phone
        FROM supplier
        WHERE id_supplier = $1
        "#,
    )
    .bind(id_supplier)
    .fetch_optional(pool)
    .await
}

pub async fn create_supplier(
    pool: &PgPool,
    payload: &CreateSupplierRequest,
) -> Result<Supplier, sqlx::Error> {
    sqlx::query_as::<_, Supplier>(
        r#"
        INSERT INTO supplier (name, email, phone)
        VALUES ($1, $2, $3)
        RETURNING id_supplier, name, email, phone
        "#,
    )
    .bind(&payload.name)
    .bind(&payload.email)
    .bind(&payload.phone)
    .fetch_one(pool)
    .await
}

pub async fn update_supplier(
    pool: &PgPool,
    id_supplier: i32,
    payload: &UpdateSupplierRequest,
) -> Result<Option<Supplier>, sqlx::Error> {
    sqlx::query_as::<_, Supplier>(
        r#"
        UPDATE supplier
        SET name = $1,
            email = $2,
            phone = $3
        WHERE id_supplier = $4
        RETURNING id_supplier, name, email, phone
        "#,
    )
    .bind(&payload.name)
    .bind(&payload.email)
    .bind(&payload.phone)
    .bind(id_supplier)
    .fetch_optional(pool)
    .await
}

pub async fn delete_supplier(pool: &PgPool, id_supplier: i32) -> Result<u64, sqlx::Error> {
    let result = sqlx::query(
        r#"
        DELETE FROM supplier
        WHERE id_supplier = $1
        "#,
    )
    .bind(id_supplier)
    .execute(pool)
    .await?;

    Ok(result.rows_affected())
}
