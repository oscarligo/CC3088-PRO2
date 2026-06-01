use actix_web::{web, HttpRequest, HttpResponse, Responder};
use crate::auth::{extract_session, AppRole};
use crate::AppState;
use crate::repository::client::ClientRepository;

pub async fn list_clients_handler(
    req: HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    if let Err(resp) = extract_session(&req, &[AppRole::Cajero, AppRole::Auditor]) {
        return resp;
    }

    match state.client_repo.list_clients().await {
        Ok(clients) => HttpResponse::Ok().json(clients),
        Err(err) => {
            log::error!("Database error fetching clients: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}