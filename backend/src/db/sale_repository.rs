use sqlx::{FromRow, PgPool};

use crate::error::{map_sqlx_error, ApiError};
use crate::models::sale::CreateSaleRequest;

#[derive(Debug, FromRow)]
struct ProductStockPrice {
    stock: i32,
    unit_price: f64,
}

pub async fn create_sale(pool: &PgPool, payload: &CreateSaleRequest) -> Result<i32, ApiError> {
    if payload.items.is_empty() {
        return Err(ApiError::bad_request("La venta debe incluir al menos 1 producto"));
    }

    for item in &payload.items {
        if item.amount <= 0 {
            return Err(ApiError::bad_request("La cantidad debe ser mayor a 0"));
        }
    }

    let mut tx = pool.begin().await.map_err(map_sqlx_error)?;

    let id_sale: i32 = match sqlx::query_scalar(
        r#"
        INSERT INTO sale (id_client, id_employee)
        VALUES ($1, $2)
        RETURNING id_sale
        "#,
    )
    .bind(payload.id_client)
    .bind(payload.id_employee)
    .fetch_one(&mut *tx)
    .await
    {
        Ok(id_sale) => id_sale,
        Err(e) => {
            let _ = tx.rollback().await;
            return Err(map_sqlx_error(e));
        }
    };

    for item in &payload.items {
        let product: Option<ProductStockPrice> = match sqlx::query_as::<_, ProductStockPrice>(
            r#"
            SELECT stock, unit_price::float8 AS unit_price
            FROM product
            WHERE id_product = $1
            FOR UPDATE
            "#,
        )
        .bind(item.id_product)
        .fetch_optional(&mut *tx)
        .await
        {
            Ok(product) => product,
            Err(e) => {
                let _ = tx.rollback().await;
                return Err(map_sqlx_error(e));
            }
        };

        let Some(product) = product else {
            let _ = tx.rollback().await;
            return Err(ApiError::bad_request(format!(
                "Producto no existe: {}",
                item.id_product
            )));
        };

        if product.stock < item.amount {
            let _ = tx.rollback().await;
            return Err(ApiError::bad_request(format!(
                "Stock insuficiente para el producto {} (stock={}, solicitado={})",
                item.id_product, product.stock, item.amount
            )));
        }

        if let Err(e) = sqlx::query(
            r#"
            INSERT INTO sale_details (id_sale, id_product, amount, sale_price)
            VALUES ($1, $2, $3, $4::numeric)
            "#,
        )
        .bind(id_sale)
        .bind(item.id_product)
        .bind(item.amount)
        .bind(product.unit_price)
        .execute(&mut *tx)
        .await
        {
            let _ = tx.rollback().await;
            return Err(map_sqlx_error(e));
        }
    }

    tx.commit().await.map_err(map_sqlx_error)?;

    Ok(id_sale)
}
