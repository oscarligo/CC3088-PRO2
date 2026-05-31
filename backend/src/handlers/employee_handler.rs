use actix_web::{web, HttpResponse, Responder};
use crate::AppState;
use crate::repository::employee::EmployeeRepository;

pub async fn list_employees_handler(
    state: web::Data<AppState>,
) -> impl Responder {
    match state.employee_repo.list_employees().await {
        Ok(employees) => HttpResponse::Ok().json(employees),
        Err(err) => {
            log::error!("Database error fetching employees: {:?}", err);
            HttpResponse::InternalServerError().json("Error interno del servidor")
        }
    }
}