use actix_web::{web, HttpResponse};
use sqlx::PgPool;

use crate::db::employee_repository;
use crate::error::{map_sqlx_error, ApiError};

pub async fn list_employees_handler(pool: web::Data<PgPool>) -> Result<HttpResponse, ApiError> {
    let employees = employee_repository::list_employees(&pool)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Ok().json(employees))
}
