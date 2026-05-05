use actix_web::{web, HttpResponse, Responder};
use sqlx::PgPool;
use crate::db::product_repository;

/*
Handler function for the GET /inventory endpoint. It retrieves the inventory data from the database
*/

pub async fn get_inventory_handler(
    pool: web::Data<PgPool>,
) -> impl Responder {
    
    match product_repository::get_inventory(&pool).await {
        Ok(inventory) => {
            HttpResponse::Ok().json(inventory)
        },
        Err(e) => {
            eprintln!("Error en base de datos: {}", e);
            
            // 500 Internal Server Error
            HttpResponse::InternalServerError().body("Error retrieving inventory")
        }
    }
}