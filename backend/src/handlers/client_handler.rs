use actix_web::{web, HttpResponse, Responder};
use crate::AppState;
use crate::repository::client::ClientRepository;

pub async fn list_clients_handler(
    state: web::Data<AppState>,
) -> impl Responder {
    match state.client_repo.list_clients().await {
        Ok(clients) => HttpResponse::Ok().json(clients),
        Err(err) => {
            log::error!("Database error fetching clients: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}