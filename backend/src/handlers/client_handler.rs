use actix_web::{web, HttpResponse};
use sqlx::PgPool;

use crate::db::client_repository;
use crate::error::{map_sqlx_error, ApiError};

pub async fn list_clients_handler(pool: web::Data<PgPool>) -> Result<HttpResponse, ApiError> {
    let clients = client_repository::list_clients(&pool)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Ok().json(clients))
}
