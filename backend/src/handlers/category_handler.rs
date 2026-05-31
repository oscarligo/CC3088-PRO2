
use actix_web::{web, HttpResponse, Responder};
use crate::AppState;
use crate::repository::category::CategoryRepository;

pub async fn list_categories_handler(
    state: web::Data<AppState>,
) -> impl Responder {

    match state.category_repo.list_categories().await {
        Ok(categories) => HttpResponse::Ok().json(categories),
        Err(err) => {
            log::error!("Database error fetching categories: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}