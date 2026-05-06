use actix_web::{web, HttpResponse};
use serde::Deserialize;
use sqlx::PgPool;

use crate::db::report_repository;
use crate::error::{map_sqlx_error, ApiError};

pub async fn sale_lines_handler(pool: web::Data<PgPool>) -> Result<HttpResponse, ApiError> {
    let rows = report_repository::list_sale_lines(&pool)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Ok().json(rows))
}

#[derive(Debug, Deserialize)]
pub struct SupplierProductCountQuery {
    pub min_products: Option<i64>,
}

pub async fn supplier_product_count_handler(
    pool: web::Data<PgPool>,
    query: web::Query<SupplierProductCountQuery>,
) -> Result<HttpResponse, ApiError> {
    let min_products = query.min_products.unwrap_or(1);
    if min_products < 0 {
        return Err(ApiError::bad_request("min_products debe ser >= 0"));
    }

    let rows = report_repository::supplier_product_count(&pool, min_products)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Ok().json(rows))
}

#[derive(Debug, Deserialize)]
pub struct CategorySalesQuery {
    pub min_total: Option<f64>,
}

pub async fn category_sales_handler(
    pool: web::Data<PgPool>,
    query: web::Query<CategorySalesQuery>,
) -> Result<HttpResponse, ApiError> {
    let min_total = query.min_total.unwrap_or(0.0);
    if min_total < 0.0 {
        return Err(ApiError::bad_request("min_total debe ser >= 0"));
    }

    let rows = report_repository::category_sales(&pool, min_total)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Ok().json(rows))
}

pub async fn unsold_products_handler(pool: web::Data<PgPool>) -> Result<HttpResponse, ApiError> {
    let rows = report_repository::unsold_products(&pool)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Ok().json(rows))
}

#[derive(Debug, Deserialize)]
pub struct ClientsWithMinSalesQuery {
    pub min_sales: Option<i64>,
}

pub async fn clients_with_min_sales_handler(
    pool: web::Data<PgPool>,
    query: web::Query<ClientsWithMinSalesQuery>,
) -> Result<HttpResponse, ApiError> {
    let min_sales = query.min_sales.unwrap_or(1);
    if min_sales <= 0 {
        return Err(ApiError::bad_request("min_sales debe ser > 0"));
    }

    let rows = report_repository::clients_with_min_sales(&pool, min_sales)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Ok().json(rows))
}

#[derive(Debug, Deserialize)]
pub struct TopClientsQuery {
    pub limit: Option<i64>,
}

pub async fn top_clients_handler(
    pool: web::Data<PgPool>,
    query: web::Query<TopClientsQuery>,
) -> Result<HttpResponse, ApiError> {
    let limit = query.limit.unwrap_or(10);
    if !(1..=100).contains(&limit) {
        return Err(ApiError::bad_request("limit debe estar entre 1 y 100"));
    }

    let rows = report_repository::top_clients(&pool, limit)
        .await
        .map_err(map_sqlx_error)?;

    Ok(HttpResponse::Ok().json(rows))
}
