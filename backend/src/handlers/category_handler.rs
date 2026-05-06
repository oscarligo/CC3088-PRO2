use actix_web::{web, HttpResponse};
use sqlx::PgPool;

use crate::db::category_repository;
use crate::error::{map_sqlx_error, ApiError};

pub async fn list_categories_handler(pool: web::Data<PgPool>) -> Result<HttpResponse, ApiError> {
    let categories = category_repository::list_categories(&pool)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Ok().json(categories))
}
