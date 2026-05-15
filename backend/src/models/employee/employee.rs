use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Employee {
    pub id_employee: i32,
    pub name: String,
    pub role: String,
}
