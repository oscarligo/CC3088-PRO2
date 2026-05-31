use sea_orm::DbErr;
use crate::models::product::Model as ProductModel;

pub trait ProductRepository {
    async fn create_product(&self, product_data: ProductModel) -> Result<ProductModel, DbErr>;
    async fn list_products(&self) -> Result<Vec<ProductModel>, DbErr>;
    async fn get_product(&self, id: i32) -> Result<Option<ProductModel>, DbErr>;
    async fn update_product(&self, id: i32, product_data: ProductModel) -> Result<ProductModel, DbErr>;
    async fn delete_product(&self, id: i32) -> Result<(), DbErr>;
}