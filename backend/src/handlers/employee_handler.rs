use actix_web::{web, HttpRequest, HttpResponse, Responder};
use crate::auth::{extract_session, AppRole};
use crate::AppState;
use crate::repository::employee::EmployeeRepository;

pub async fn list_employees_handler(
    req: HttpRequest,
    state: web::Data<AppState>,
) -> impl Responder {
    if let Err(resp) = extract_session(&req, &[AppRole::Cajero, AppRole::Auditor]) {
        return resp;
    }

    match state.employee_repo.list_employees().await {
        Ok(employees) => HttpResponse::Ok().json(employees),
        Err(err) => {
            log::error!("Database error fetching employees: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}