use actix_web::{web, HttpResponse};
use sqlx::PgPool;

use crate::db::sale_repository;
use crate::error::ApiError;
use crate::models::sale::{CreateSaleRequest, CreateSaleResponse};

pub async fn create_sale_handler(
    pool: web::Data<PgPool>,
    payload: web::Json<CreateSaleRequest>,
) -> Result<HttpResponse, ApiError> {
    let payload = payload.into_inner();

    if payload.id_employee <= 0 {
        return Err(ApiError::bad_request("id_employee inválido"));
    }

    let id_sale = sale_repository::create_sale(&pool, &payload).await?;

    Ok(HttpResponse::Created().json(CreateSaleResponse { id_sale }))
}
