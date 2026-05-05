use sqlx::PgPool;
use crate::models::product::InventoryProduct;

/*
Retrieves a list of all products in the inventory with their associated category and supplier information.
 */

pub async fn get_inventory(pool: &PgPool) -> Result<Vec<InventoryProduct>, sqlx::Error> {
    let products = sqlx::query_as::<_, InventoryProduct>(
        r#"
        SELECT 
            p.id_product, 
            p.name AS product_name, 
            p.unit_price::float8 AS unit_price,
            p.stock, 
            c.name AS category_name, 
            s.name AS supplier_name
        FROM product p
        INNER JOIN product_category c ON p.id_category = c.id_category
        INNER JOIN supplier s ON p.id_supplier = s.id_supplier
        ORDER BY p.id_product
        "#,
    )
    .fetch_all(pool)
    .await?;

    Ok(products)
}