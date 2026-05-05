use actix_web::{web, HttpResponse, Responder};
use sqlx::PgPool;
use crate::db::product_repository;

// Handler para el endpoint GET /api/products/inventory
pub async fn get_inventory_handler(
    // Extraemos el pool de base de datos inyectado por Actix
    pool: web::Data<PgPool>,
) -> impl Responder {
    
    // Llamamos a nuestro repositorio
    match product_repository::get_inventory(&pool).await {
        Ok(inventory) => {
            // Si todo sale bien, devolvemos un 200 OK con el JSON
            HttpResponse::Ok().json(inventory)
        },
        Err(e) => {
            // Imprimimos el error interno en la consola para depurar
            eprintln!("Error en base de datos: {}", e);
            
            // Devolvemos un 500 Internal Server Error con un mensaje limpio para el usuario[cite: 1]
            HttpResponse::InternalServerError().body("Error al cargar el inventario. Intente más tarde.")
        }
    }
}