use serde::{Deserialize, Serialize};
use sqlx::FromRow;
/*
A struct representing a product in the inventory, with fields 
corresponding to the columns in the "product" table of the database.
*/

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct InventoryProduct {
    pub id_product: i32,
    pub product_name: String,
    pub unit_price: f64,
    pub stock: i32,
    pub category_name: String,
    pub supplier_name: String,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Product {
    pub id_product: i32,
    pub name: String,
    pub unit_price: f64,
    pub stock: i32,
    pub id_category: i32,
    pub id_supplier: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProductRequest {
    pub name: String,
    pub unit_price: f64,
    pub stock: i32,
    pub id_category: i32,
    pub id_supplier: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateProductRequest {
    pub name: String,
    pub unit_price: f64,
    pub stock: i32,
    pub id_category: i32,
    pub id_supplier: i32,
}