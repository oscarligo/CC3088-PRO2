use actix_cors::Cors;
use actix_web::{http::header, web, App, HttpServer};
use sqlx::postgres::PgPoolOptions;
use dotenv::dotenv;
use std::env;



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
            .allowed_origin_fn(|origin, _req_head| {
                origin.as_bytes().starts_with(b"http://localhost:")
                    || origin.as_bytes().starts_with(b"http://127.0.0.1:")
            })
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec![header::ACCEPT, header::CONTENT_TYPE])
            .max_age(3600);
    // App instance with CORS middleware and route configuration
        App::new()
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
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