use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct SaleLine {
    pub id_sale: i32,
    pub sale_date: String,
    pub client_name: Option<String>,
    pub employee_name: String,
    pub product_name: String,
    pub amount: i32,
    pub sale_price: f64,
    pub line_total: f64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct SupplierProductCount {
    pub id_supplier: i32,
    pub supplier_name: String,
    pub products_count: i64,
    pub avg_unit_price: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct CategorySales {
    pub id_category: i32,
    pub category_name: String,
    pub items_sold: i64,
    pub sales_count: i64,
    pub total_revenue: f64,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct TopClient {
    pub id_client: i32,
    pub client_name: String,
    pub total_spent: f64,
    pub sales_count: i64,
}
