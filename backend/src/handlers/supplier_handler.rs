use actix_web::{web, HttpResponse, Responder};

use crate::models::supplier::Model as SupplierModel;
use crate::repository::supplier::SupplierRepository;
use crate::AppState;

pub async fn list_suppliers_handler(state: web::Data<AppState>) -> impl Responder {
    match state.supplier_repo.list_suppliers().await {
        Ok(suppliers) => HttpResponse::Ok().json(suppliers),
        Err(err) => {
            log::error!("Database error listing suppliers: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}

pub async fn get_supplier_handler(state: web::Data<AppState>, id: web::Path<i32>) -> impl Responder {
    let supplier_id = id.into_inner();

    match state.supplier_repo.get_supplier(supplier_id).await {
        Ok(Some(supplier)) => HttpResponse::Ok().json(supplier),
        Ok(None) => HttpResponse::NotFound().json("Proveedor no encontrado"),
        Err(err) => {
            log::error!(
                "Database error fetching supplier {}: {:?}",
                supplier_id,
                err
            );
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}

pub async fn create_supplier_handler(
    state: web::Data<AppState>,
    payload: web::Json<SupplierModel>,
) -> impl Responder {
    let supplier_data = payload.into_inner();

    if supplier_data.name.trim().is_empty() {
        return HttpResponse::BadRequest().json("El nombre es obligatorio");
    }

    match state.supplier_repo.create_supplier(supplier_data).await {
        Ok(created) => HttpResponse::Created().json(created),
        Err(err) => {
            log::error!("Database error creating supplier: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}

pub async fn update_supplier_handler(
    state: web::Data<AppState>,
    id: web::Path<i32>,
    payload: web::Json<SupplierModel>,
) -> impl Responder {
    let supplier_id = id.into_inner();
    let supplier_data = payload.into_inner();

    if supplier_data.name.trim().is_empty() {
        return HttpResponse::BadRequest().json("El nombre es obligatorio");
    }

    match state
        .supplier_repo
        .update_supplier(supplier_id, supplier_data)
        .await
    {
        Ok(updated) => HttpResponse::Ok().json(updated),
        Err(sea_orm::DbErr::RecordNotFound(_)) => {
            HttpResponse::NotFound().json("Proveedor no encontrado")
        }
        Err(err) => {
            log::error!(
                "Database error updating supplier {}: {:?}",
                supplier_id,
                err
            );
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}

pub async fn delete_supplier_handler(
    state: web::Data<AppState>,
    id: web::Path<i32>,
) -> impl Responder {
    let supplier_id = id.into_inner();

    match state.supplier_repo.delete_supplier(supplier_id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(sea_orm::DbErr::RecordNotFound(_)) => {
            HttpResponse::NotFound().json("Proveedor no encontrado")
        }
        Err(err) => {
            log::error!(
                "Database error deleting supplier {}: {:?}",
                supplier_id,
                err
            );
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}
