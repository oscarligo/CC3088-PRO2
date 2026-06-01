
use actix_web::{web, HttpRequest, HttpResponse, Responder};
use crate::auth::{extract_session, AppRole};
use crate::AppState;
use crate::repository::category::CategoryRepository;

pub async fn list_categories_handler(
    req: HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    if let Err(resp) = extract_session(&req, &[AppRole::Inventario, AppRole::Analista]) {
        return resp;
    }

    match state.category_repo.list_categories().await {
        Ok(categories) => HttpResponse::Ok().json(categories),
        Err(err) => {
            log::error!("Database error fetching categories: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}