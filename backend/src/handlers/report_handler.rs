use actix_web::{web, HttpRequest, HttpResponse, Responder};
use serde::Deserialize;
use crate::auth::{extract_session, AppRole};
use crate::AppState;
use crate::repository::report::ReportRepository;

// 1. GET /api/reports/sale-lines
pub async fn sale_lines_handler(req: HttpRequest, state: web::Data<AppState>) -> impl Responder {
    if let Err(resp) = extract_session(&req, &[AppRole::Analista]) {
        return resp;
    }

    match state.report_repo.list_sale_lines().await {
        Ok(rows) => HttpResponse::Ok().json(rows),
        Err(err) => {
            log::error!("Database error fetching sale lines report: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}

// 2. GET /api/reports/supplier-product-count?min_products=X
#[derive(Debug, Deserialize)]
pub struct SupplierProductCountQuery {
    pub min_products: Option<i64>,
}

pub async fn supplier_product_count_handler(
    req: HttpRequest,
    state: web::Data<AppState>,
    query: web::Query<SupplierProductCountQuery>,
) -> impl Responder {
    if let Err(resp) = extract_session(&req, &[AppRole::Analista]) {
        return resp;
    }

    let min_products = query.min_products.unwrap_or(1);
    if min_products < 0 {
        return HttpResponse::BadRequest().json("min_products debe ser >= 0");
    }

    match state.report_repo.supplier_product_count(min_products).await {
        Ok(rows) => HttpResponse::Ok().json(rows),
        Err(err) => {
            log::error!("Database error fetching supplier product count: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}

// 3. GET /api/reports/category-sales?min_total=X
#[derive(Debug, Deserialize)]
pub struct CategorySalesQuery {
    pub min_total: Option<f64>,
}

pub async fn category_sales_handler(
    req: HttpRequest,
    state: web::Data<AppState>,
    query: web::Query<CategorySalesQuery>,
) -> impl Responder {
    if let Err(resp) = extract_session(&req, &[AppRole::Analista]) {
        return resp;
    }

    let min_total = query.min_total.unwrap_or(0.0);
    if min_total < 0.0 {
        return HttpResponse::BadRequest().json("min_total debe ser >= 0");
    }

    match state.report_repo.category_sales(min_total).await {
        Ok(rows) => HttpResponse::Ok().json(rows),
        Err(err) => {
            log::error!("Database error fetching category sales: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}

// 4. GET /api/reports/unsold-products
pub async fn unsold_products_handler(req: HttpRequest, state: web::Data<AppState>) -> impl Responder {
    if let Err(resp) = extract_session(&req, &[AppRole::Analista]) {
        return resp;
    }

    match state.report_repo.unsold_products().await {
        Ok(rows) => HttpResponse::Ok().json(rows),
        Err(err) => {
            log::error!("Database error fetching unsold products report: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}

// 5. GET /api/reports/clients-min-sales?min_sales=X
#[derive(Debug, Deserialize)]
pub struct ClientsWithMinSalesQuery {
    pub min_sales: Option<i64>,
}

pub async fn clients_with_min_sales_handler(
    req: HttpRequest,
    state: web::Data<AppState>,
    query: web::Query<ClientsWithMinSalesQuery>,
) -> impl Responder {
    if let Err(resp) = extract_session(&req, &[AppRole::Analista]) {
        return resp;
    }

    let min_sales = query.min_sales.unwrap_or(1);
    if min_sales <= 0 {
        return HttpResponse::BadRequest().json("min_sales debe ser > 0");
    }

    match state.report_repo.clients_with_min_sales(min_sales).await {
        Ok(rows) => HttpResponse::Ok().json(rows),
        Err(err) => {
            log::error!("Database error fetching clients with min sales: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}

// 6. GET /api/reports/top-clients?limit=X
#[derive(Debug, Deserialize)]
pub struct TopClientsQuery {
    pub limit: Option<i64>,
}

pub async fn top_clients_handler(
    req: HttpRequest,
    state: web::Data<AppState>,
    query: web::Query<TopClientsQuery>,
) -> impl Responder {
    if let Err(resp) = extract_session(&req, &[AppRole::Analista]) {
        return resp;
    }

    let limit = query.limit.unwrap_or(10);
    if !(1..=100).contains(&limit) {
        return HttpResponse::BadRequest().json("limit debe estar entre 1 y 100");
    }

    match state.report_repo.top_clients(limit).await {
        Ok(rows) => HttpResponse::Ok().json(rows),
        Err(err) => {
            log::error!("Database error fetching top clients: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}