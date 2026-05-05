use sqlx::PgPool;
use crate::models::product::Product;

pub async fn get_inventory(pool: &PgPool) -> Result<Vec<Product>, sqlx::Error> {
    // Consulta con JOIN entre múltiples tablas, visible en la UI (10 puntos de rúbrica)
    let products = sqlx::query_as!(
        Product,
        r#"
        SELECT 
            p.id_product, 
            p.name as product_name, 
            p.stock, 
            c.name as category_name, 
            s.name as supplier_name
        FROM product p
        INNER JOIN product_category c ON p.id_category = c.id_category
        INNER JOIN supplier s ON p.id_supplier = s.id_supplier
        "#
    )
    .fetch_all(pool)
    .await?;

    Ok(products)
}