use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};

use crate::models::sale_details::Model as SaleDetailModel;
use crate::repository::sale::SaleRepository;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct CreateSaleDetailRequest {
    pub id_product: i32,
    pub amount: i32,
    pub price_at_sale: f64,
}

#[derive(Debug, Deserialize)]
pub struct CreateSaleRequest {
    pub id_client: Option<i32>,
    pub id_employee: i32,
    pub details: Vec<CreateSaleDetailRequest>,
}

#[derive(Debug, Serialize)]
pub struct CreateSaleResponse {
    pub sale: crate::models::sale::Model,
    pub details: Vec<SaleDetailModel>,
}

pub async fn create_sale_handler(
    state: web::Data<AppState>,
    payload: web::Json<CreateSaleRequest>,
) -> impl Responder {
    let payload = payload.into_inner();

    if payload.id_employee <= 0 {
        return HttpResponse::BadRequest().json("id_employee invalido");
    }

    if payload.details.is_empty() {
        return HttpResponse::BadRequest().json("La venta debe incluir al menos un detalle");
    }

    for detail in &payload.details {
        if detail.id_product <= 0 {
            return HttpResponse::BadRequest().json("id_product invalido");
        }
        if detail.amount <= 0 {
            return HttpResponse::BadRequest().json("amount debe ser > 0");
        }
        if detail.price_at_sale < 0.0 {
            return HttpResponse::BadRequest().json("price_at_sale debe ser >= 0");
        }
    }

    let details: Vec<SaleDetailModel> = payload
        .details
        .into_iter()
        .map(|d| SaleDetailModel {
            id_sale_detail: 0,
            id_sale: 0,
            id_product: d.id_product,
            amount: d.amount,
            sale_price: d.price_at_sale,
        })
        .collect();

    match state
        .sale_repo
        .create_sale(payload.id_client, payload.id_employee, details)
        .await
    {
        Ok((sale, details)) => HttpResponse::Created().json(CreateSaleResponse { sale, details }),
        Err(err) => {
            log::error!("Database error creating sale: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}
