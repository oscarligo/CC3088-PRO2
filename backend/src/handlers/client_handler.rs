use actix_web::{web, HttpResponse, Responder};
use crate::AppState;
use crate::repository::client::ClientRepository;

pub async fn list_clients_handler(
    state: web::Data<AppState>,
) -> impl Responder {
    // Consumimos el repositorio de clientes envuelto en el Arc desde el AppState
    match state.client_repo.list_clients().await {
        Ok(clients) => HttpResponse::Ok().json(clients),
        Err(err) => {
            // La macro log::error ya funcionará perfectamente tras haberla agregado al Cargo.toml
            log::error!("Database error fetching clients: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}