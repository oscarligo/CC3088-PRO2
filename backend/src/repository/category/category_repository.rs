use async_trait::async_trait;
use sea_orm::*;

pub struct CategoryRepository {
    pub db: DatabaseConnection,
}

#[async_trait]
pub trait CategoryRepository {
    async fn get_category(&self, id: i32) -> Result<Category, DbErr>;
}

