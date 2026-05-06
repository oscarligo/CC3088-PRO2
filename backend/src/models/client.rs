use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Client {
    pub id_client: i32,
    pub name: String,
    pub nit: Option<String>,
    pub email: Option<String>,
}
