use sqlx::PgPool;

use crate::models::category::Category;

pub async fn list_categories(pool: &PgPool) -> Result<Vec<Category>, sqlx::Error> {
    sqlx::query_as::<_, Category>(
        r#"
        SELECT id_category, name, description
        FROM product_category
        ORDER BY id_category
        "#,
    )
    .fetch_all(pool)
    .await
}
