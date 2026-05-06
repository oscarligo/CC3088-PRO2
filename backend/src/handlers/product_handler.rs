use actix_web::{web, HttpResponse};
use sqlx::PgPool;
use crate::db::product_repository;
use crate::error::{map_sqlx_error, ApiError};
use crate::models::product::{CreateProductRequest, UpdateProductRequest};

/*
Handler function for the GET /inventory endpoint. It retrieves the inventory data from the database
*/

pub async fn get_inventory_handler(
    pool: web::Data<PgPool>,
) -> Result<HttpResponse, ApiError> {
    let inventory = product_repository::get_inventory(&pool)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Ok().json(inventory))
}

pub async fn list_products_handler(pool: web::Data<PgPool>) -> Result<HttpResponse, ApiError> {
    let products = product_repository::list_products(&pool)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Ok().json(products))
}

pub async fn get_product_handler(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
) -> Result<HttpResponse, ApiError> {
    let product = product_repository::get_product(&pool, id.into_inner())
        .await
        .map_err(map_sqlx_error)?;

    match product {
        Some(product) => Ok(HttpResponse::Ok().json(product)),
        None => Err(ApiError::not_found("Producto no encontrado")),
    }
}

pub async fn create_product_handler(
    pool: web::Data<PgPool>,
    payload: web::Json<CreateProductRequest>,
) -> Result<HttpResponse, ApiError> {
    let payload = payload.into_inner();

    if payload.name.trim().is_empty() {
        return Err(ApiError::bad_request("El nombre es obligatorio"));
    }
    if payload.unit_price < 0.0 {
        return Err(ApiError::bad_request("El precio debe ser >= 0"));
    }
    if payload.stock < 0 {
        return Err(ApiError::bad_request("El stock debe ser >= 0"));
    }

    let created = product_repository::create_product(&pool, &payload)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Created().json(created))
}

pub async fn update_product_handler(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
    payload: web::Json<UpdateProductRequest>,
) -> Result<HttpResponse, ApiError> {
    let id = id.into_inner();
    let payload = payload.into_inner();

    if payload.name.trim().is_empty() {
        return Err(ApiError::bad_request("El nombre es obligatorio"));
    }
    if payload.unit_price < 0.0 {
        return Err(ApiError::bad_request("El precio debe ser >= 0"));
    }
    if payload.stock < 0 {
        return Err(ApiError::bad_request("El stock debe ser >= 0"));
    }

    let updated = product_repository::update_product(&pool, id, &payload)
        .await
        .map_err(map_sqlx_error)?;

    match updated {
        Some(product) => Ok(HttpResponse::Ok().json(product)),
        None => Err(ApiError::not_found("Producto no encontrado")),
    }
}

pub async fn delete_product_handler(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
) -> Result<HttpResponse, ApiError> {
    let affected = product_repository::delete_product(&pool, id.into_inner())
        .await
        .map_err(map_sqlx_error)?;

    if affected == 0 {
        return Err(ApiError::not_found("Producto no encontrado"));
    }

    Ok(HttpResponse::NoContent().finish())
}