// src/repository/report/repository.rs
use sea_orm::DbErr;
use crate::models::inventory::Model as InventoryItem;
use crate::models::client::Model as Client;
use crate::models::report::{CategorySales, SaleLine, SupplierProductCount, TopClient};

pub trait ReportRepository {
    async fn list_sale_lines(&self) -> Result<Vec<SaleLine>, DbErr>;
    async fn supplier_product_count(&self, min_products: i64) -> Result<Vec<SupplierProductCount>, DbErr>;
    async fn category_sales(&self, min_total: f64) -> Result<Vec<CategorySales>, DbErr>;
    async fn unsold_products(&self) -> Result<Vec<InventoryItem>, DbErr>;
    async fn clients_with_min_sales(&self, min_sales: i64) -> Result<Vec<Client>, DbErr>;
    async fn top_clients(&self, limit: i64) -> Result<Vec<TopClient>, DbErr>;
}