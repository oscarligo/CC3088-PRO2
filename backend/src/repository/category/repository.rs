use sea_orm::DbErr;
use crate::models::category::Model as CategoryModel;

pub trait CategoryRepository {
    async fn get_category(&self, id: i32) -> Result<Option<CategoryModel>, DbErr>;
    async fn list_categories(&self) -> Result<Vec<CategoryModel>, DbErr>;
}