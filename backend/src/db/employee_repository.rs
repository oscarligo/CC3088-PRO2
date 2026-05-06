use sqlx::PgPool;

use crate::models::employee::Employee;

pub async fn list_employees(pool: &PgPool) -> Result<Vec<Employee>, sqlx::Error> {
    sqlx::query_as::<_, Employee>(
        r#"
        SELECT id_employee, name, role
        FROM employee
        ORDER BY id_employee
        "#,
    )
    .fetch_all(pool)
    .await
}
