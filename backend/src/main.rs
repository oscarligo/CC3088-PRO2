// src/main.rs

use actix_cors::Cors;
use actix_web::{http::header, web, App, HttpServer};
use dotenv::dotenv;
use std::env;
use std::sync::Arc;
use sea_orm::Database;

// Importaciones de tus repositorios
use crate::repository::category::CategoryRepositoryImpl;
use crate::repository::client::ClientRepositoryImpl;
use crate::repository::employee::EmployeeRepositoryImpl;
use crate::repository::product::ProductRepositoryImpl;
use crate::repository::report::ReportRepositoryImpl;
use crate::repository::sale::SaleRepositoryImpl;
use crate::repository::sale_details::SaleDetailRepositoryImpl;
use crate::repository::supplier::SupplierRepositoryImpl;

pub mod models;  
pub mod handlers; 
pub mod repository;

pub struct AppState {
    pub category_repo: Arc<CategoryRepositoryImpl>,
    pub client_repo: Arc<ClientRepositoryImpl>,
    pub employee_repo: Arc<EmployeeRepositoryImpl>,
    pub product_repo: Arc<ProductRepositoryImpl>,
    pub report_repo: Arc<ReportRepositoryImpl>,
    pub sale_repo: Arc<SaleRepositoryImpl>,
    pub sale_detail_repo: Arc<SaleDetailRepositoryImpl>,
    pub supplier_repo: Arc<SupplierRepositoryImpl>,
}   

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Logger setup
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    
    // Env configuration
    dotenv().ok();
    let database_url: String = env::var("DATABASE_URL").expect("DATABASE_URL is not set in .env file");
    let port: u16 = env::var("BACKEND_PORT")
        .ok()
        .and_then(|p: String| p.parse().ok())
        .unwrap_or(8080);

    // Database connection pool
    let db = Database::connect(&database_url)
        .await
        .expect("Failed to connect to the database");

    println!("Server running on http://localhost:{}", port);

    // 🌟 OPTIMIZACIÓN CRÍTICA: Inicialización ÚNICA fuera del servidor web
    // Al instanciarlos aquí, el pool y tus structs viven en un solo bloque de memoria global.
    let shared_state = web::Data::new(AppState {
        category_repo: Arc::new(CategoryRepositoryImpl { db: db.clone() }),
        client_repo: Arc::new(ClientRepositoryImpl { db: db.clone() }),
        employee_repo: Arc::new(EmployeeRepositoryImpl { db: db.clone() }),
        product_repo: Arc::new(ProductRepositoryImpl { db: db.clone() }),
        report_repo: Arc::new(ReportRepositoryImpl { db: db.clone() }),
        sale_repo: Arc::new(SaleRepositoryImpl { db: db.clone() }),
        sale_detail_repo: Arc::new(SaleDetailRepositoryImpl { db: db.clone() }),
        supplier_repo: Arc::new(SupplierRepositoryImpl { db: db.clone() }),
    });

    // Actix-web server
    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec![header::ACCEPT, header::CONTENT_TYPE])
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(shared_state.clone())
            .service(
                web::scope("/api")
                    .service(
                        web::scope("/products")
                            .route("/inventory", web::get().to(handlers::product_handler::get_inventory_handler))
                            .route("", web::get().to(handlers::product_handler::list_products_handler))
                            .route("/{id}", web::get().to(handlers::product_handler::get_product_handler))
                            .route("", web::post().to(handlers::product_handler::create_product_handler))
                            .route("/{id}", web::put().to(handlers::product_handler::update_product_handler))
                            .route("/{id}", web::delete().to(handlers::product_handler::delete_product_handler))
                    )
                    .service(
                        web::scope("/suppliers")
                            .route("", web::get().to(handlers::supplier_handler::list_suppliers_handler))
                            .route("/{id}", web::get().to(handlers::supplier_handler::get_supplier_handler))
                            .route("", web::post().to(handlers::supplier_handler::create_supplier_handler))
                            .route("/{id}", web::put().to(handlers::supplier_handler::update_supplier_handler))
                            .route("/{id}", web::delete().to(handlers::supplier_handler::delete_supplier_handler))
                    )
                    .service(
                        web::scope("/categories")
                            .route("", web::get().to(handlers::category_handler::list_categories_handler))
                    )
                    .service(
                        web::scope("/clients")
                            .route("", web::get().to(handlers::client_handler::list_clients_handler))
                    )
                    .service(
                        web::scope("/employees")
                            .route("", web::get().to(handlers::employee_handler::list_employees_handler))
                    )
                    .service(
                        web::scope("/reports")
                            .route("/sale-lines", web::get().to(handlers::report_handler::sale_lines_handler))
                            .route(
                                "/supplier-product-count",
                                web::get().to(handlers::report_handler::supplier_product_count_handler),
                            )
                            .route(
                                "/category-sales",
                                web::get().to(handlers::report_handler::category_sales_handler),
                            )
                            .route(
                                "/unsold-products",
                                web::get().to(handlers::report_handler::unsold_products_handler),
                            )
                            .route(
                                "/clients-min-sales",
                                web::get().to(handlers::report_handler::clients_with_min_sales_handler),
                            )
                            .route(
                                "/top-clients",
                                web::get().to(handlers::report_handler::top_clients_handler),
                            )
                    )
                    .service(
                        web::scope("/sales")
                            .route("", web::post().to(handlers::sale_handler::create_sale_handler))
                    )
            )
    })
    .bind(format!("0.0.0.0:{}", port))?
    .run()
    .await
}