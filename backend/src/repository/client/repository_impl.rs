use sqlx::PgPool;

use crate::models::client::Client;

pub async fn list_clients(pool: &PgPool) -> Result<Vec<Client>, sqlx::Error> {
    sqlx::query_as::<_, Client>(
        r#"
        SELECT id_client, name, nit, email
        FROM client
        ORDER BY id_client
        "#,
    )
    .fetch_all(pool)
    .await
}
