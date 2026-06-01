use serde::{Deserialize, Serialize};
use sea_orm::FromQueryResult;
use sea_orm::prelude::Decimal;

#[derive(Debug, Serialize, Deserialize, FromQueryResult)] 
pub struct SaleLine {
    pub id_sale: i32,
    pub sale_date: String,
    pub client_name: Option<String>,
    pub employee_name: String,
    pub product_name: String,
    pub amount: i32,
    pub sale_price: Decimal,
    pub line_total: Decimal,
}

#[derive(Debug, Serialize, Deserialize, FromQueryResult)] 
#[serde(rename_all = "snake_case")] 
pub struct CategorySales {
    #[serde(alias = "categoria")]
    pub category_name: String, 
    #[serde(alias = "ingresos")]
    pub total_revenue: Decimal,
    pub id_category: Option<i32>, 
    pub items_sold: Option<i64>,
    pub sales_count: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, FromQueryResult)] 
#[serde(rename_all = "snake_case")]
pub struct TopClient {
    #[serde(alias = "name")]
    pub client_name: String,
    
    #[serde(alias = "total_vendido")]
    pub total_spent: Decimal, 
    
    pub id_client: Option<i32>,
    pub sales_count: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, FromQueryResult)]
#[serde(rename_all = "snake_case")]
pub struct SupplierProductCount {
    pub id_supplier: i32,
    pub supplier_name: String,
    pub products_count: i64,
    pub avg_unit_price: Option<Decimal>,
}