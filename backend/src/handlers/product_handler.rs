use actix_web::{web, HttpResponse, Responder};
use crate::AppState;
use crate::repository::product::ProductRepository;
use crate::models::product::Model as ProductModel;

// 1. GET /api/products/inventory
pub async fn get_inventory_handler(
    state: web::Data<AppState>,
) -> impl Responder {

    match state.product_repo.list_products().await {
        Ok(inventory) => HttpResponse::Ok().json(inventory),
        Err(err) => {
            log::error!("Database error fetching inventory: {:?}", err);
            HttpResponse::InternalServerError().json("Internal server error")
        }
    }
}

// 2. GET /api/products
pub async fn list_products_handler(
    state: web::Data<AppState>,
) -> impl Responder {
    match state.product_repo.list_products().await {
        Ok(products) => HttpResponse::Ok().json(products),
        Err(err) => {
            log::error!("Database error listing products: {:?}", err);
            HttpResponse::InternalServerError().json("Internal server error")
        }
    }
}

// 3. GET /api/products/{id}
pub async fn get_product_handler(
    state: web::Data<AppState>,
    id: web::Path<i32>,
) -> impl Responder {
    let product_id = id.into_inner();

    match state.product_repo.get_product(product_id).await {
        Ok(Some(product)) => HttpResponse::Ok().json(product),
        Ok(None) => HttpResponse::NotFound().json("Product not found"),
        Err(err) => {
            log::error!("Database error fetching product {}: {:?}", product_id, err);
            HttpResponse::InternalServerError().json("Internal server error")
        }
    }
}

// 4. POST /api/products
pub async fn create_product_handler(
    state: web::Data<AppState>,
    payload: web::Json<ProductModel>, 
) -> impl Responder {
    let product_data = payload.into_inner();

    if product_data.name.trim().is_empty() {
        return HttpResponse::BadRequest().json("Name is required");
    }
    if product_data.unit_price.is_sign_negative() {
        return HttpResponse::BadRequest().json("Unit price must be >= 0");
    }
    if product_data.stock < 0 {
        return HttpResponse::BadRequest().json("Stock must be >= 0");
    }

    match state.product_repo.create_product(product_data).await {
        Ok(created) => HttpResponse::Created().json(created),
        Err(err) => {
            log::error!("Database error creating product: {:?}", err);
            HttpResponse::InternalServerError().json("Internal server error")
        }
    }
}   


//  5. PUT /api/products/{id}
pub async fn update_product_handler(
    state: web::Data<AppState>,
    id: web::Path<i32>,
    payload: web::Json<ProductModel>,
) -> impl Responder {
    let product_id = id.into_inner();
    let product_data = payload.into_inner();

    if product_data.name.trim().is_empty() {
        return HttpResponse::BadRequest().json("Name is required");
    }
    if product_data.unit_price.is_sign_negative() {
        return HttpResponse::BadRequest().json("Unit price must be >= 0");
    }
    if product_data.stock < 0 {
        return HttpResponse::BadRequest().json("Stock must be >= 0");
    }

    match state.product_repo.update_product(product_id, product_data).await {
        Ok(updated) => HttpResponse::Ok().json(updated),
        Err(sea_orm::DbErr::RecordNotFound(_)) => HttpResponse::NotFound().json("Product not found"),
        Err(err) => {
            log::error!("Database error updating product {}: {:?}", product_id, err);
            HttpResponse::InternalServerError().json("Internal server error")
        }
    }
}

// 6. DELETE /api/products/{id}
pub async fn delete_product_handler(
    state: web::Data<AppState>,
    id: web::Path<i32>,
) -> impl Responder {
    let product_id = id.into_inner();

    match state.product_repo.delete_product(product_id).await {
        Ok(_) => HttpResponse::NoContent().finish(),
        Err(sea_orm::DbErr::RecordNotFound(_)) => HttpResponse::NotFound().json("Product not found"),
        Err(err) => {
            log::error!("Database error deleting product {}: {:?}", product_id, err);
            HttpResponse::InternalServerError().json("Internal server error")
        }
    }
}