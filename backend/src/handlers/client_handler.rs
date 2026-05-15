use actix_web::{web, HttpResponse};
use sqlx::PgPool;

use crate::db::client_repository_impl;
use crate::error::{map_sqlx_error, ApiError};

pub async fn list_clients_handler(pool: web::Data<PgPool>) -> Result<HttpResponse, ApiError> {
    let clients = client_repository_impl::list_clients(&pool)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Ok().json(clients))
}
