use actix_web::{web, HttpResponse};
use sqlx::PgPool;

use crate::db::supplier_repository;
use crate::error::{map_sqlx_error, ApiError};
use crate::models::supplier::{CreateSupplierRequest, UpdateSupplierRequest};

pub async fn list_suppliers_handler(pool: web::Data<PgPool>) -> Result<HttpResponse, ApiError> {
    let suppliers = supplier_repository::list_suppliers(&pool)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Ok().json(suppliers))
}

pub async fn get_supplier_handler(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
) -> Result<HttpResponse, ApiError> {
    let supplier = supplier_repository::get_supplier(&pool, id.into_inner())
        .await
        .map_err(map_sqlx_error)?;

    match supplier {
        Some(supplier) => Ok(HttpResponse::Ok().json(supplier)),
        None => Err(ApiError::not_found("Proveedor no encontrado")),
    }
}

pub async fn create_supplier_handler(
    pool: web::Data<PgPool>,
    payload: web::Json<CreateSupplierRequest>,
) -> Result<HttpResponse, ApiError> {
    let payload = payload.into_inner();

    if payload.name.trim().is_empty() {
        return Err(ApiError::bad_request("El nombre es obligatorio"));
    }

    let created = supplier_repository::create_supplier(&pool, &payload)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Created().json(created))
}

pub async fn update_supplier_handler(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
    payload: web::Json<UpdateSupplierRequest>,
) -> Result<HttpResponse, ApiError> {
    let id = id.into_inner();
    let payload = payload.into_inner();

    if payload.name.trim().is_empty() {
        return Err(ApiError::bad_request("El nombre es obligatorio"));
    }

    let updated = supplier_repository::update_supplier(&pool, id, &payload)
        .await
        .map_err(map_sqlx_error)?;

    match updated {
        Some(supplier) => Ok(HttpResponse::Ok().json(supplier)),
        None => Err(ApiError::not_found("Proveedor no encontrado")),
    }
}

fn map_delete_supplier_error(error: sqlx::Error) -> ApiError {
    if let sqlx::Error::Database(db_err) = &error {
        if db_err.code().as_deref() == Some("23503") {
            return ApiError::conflict("No se puede eliminar el proveedor: tiene productos asociados");
        }
    }

    map_sqlx_error(error)
}

pub async fn delete_supplier_handler(
    pool: web::Data<PgPool>,
    id: web::Path<i32>,
) -> Result<HttpResponse, ApiError> {
    let affected = supplier_repository::delete_supplier(&pool, id.into_inner())
        .await
        .map_err(map_delete_supplier_error)?;

    if affected == 0 {
        return Err(ApiError::not_found("Proveedor no encontrado"));
    }

    Ok(HttpResponse::NoContent().finish())
}
