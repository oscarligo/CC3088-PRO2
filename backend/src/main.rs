use actix_cors::Cors;
use actix_web::{http::header, web, App, HttpServer};
use sqlx::postgres::PgPoolOptions;
use dotenv::dotenv;
use std::env;

mod models;
mod db;
mod handlers;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // env 
    dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL is not set in .env file");
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());

    // Database connection pool
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Error while connecting to the database");

    println!("Server running on http://localhost:{}", port);

    // Actix-web server
    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:5173")
            .allowed_origin("http://127.0.0.1:5173")
            .allowed_methods(vec!["GET", "OPTIONS"])
            .allowed_headers(vec![header::ACCEPT, header::CONTENT_TYPE])
            .max_age(3600);
    // App instance with CORS middleware and route configuration
        App::new()
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .service(
                web::scope("/api/products")
                    .route("/inventory", web::get().to(handlers::product_handler::get_inventory_handler))
            )
    })
    .bind(format!("0.0.0.0:{}", port))?
    .run()
    .await
}