use actix_web::{web, HttpResponse, Responder};

use crate::auth::{login_with_database_credentials, LoginRequest};

pub async fn login_handler(
    db_url: web::Data<String>,
    payload: web::Json<LoginRequest>,
) -> impl Responder {
    let payload = payload.into_inner();

    if payload.username.trim().is_empty() || payload.password.is_empty() {
        return HttpResponse::BadRequest().json("username y password son obligatorios");
    }

    match login_with_database_credentials(db_url.get_ref(), &payload.username, &payload.password).await {
        Ok(session) => HttpResponse::Ok().json(session),
        Err(message) if message == "Credenciales incorrectas" => HttpResponse::Unauthorized().json(message),
        Err(message) => HttpResponse::BadRequest().json(message),
    }
}