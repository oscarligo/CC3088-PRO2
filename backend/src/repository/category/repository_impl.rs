use sea_orm::{DatabaseConnection, EntityTrait, DbErr};
use super::repository::CategoryRepository;
use crate::models::category::{Entity as CategoryEntity, Model as CategoryModel};

pub struct CategoryRepositoryImpl {
    pub db: DatabaseConnection,
}

// Constructor
impl CategoryRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}
// Implementation of the Trait for the Repository Implementation
impl CategoryRepository for CategoryRepositoryImpl {
    
    async fn get_category(&self, id: i32) -> Result<Option<CategoryModel>, DbErr> {
        CategoryEntity::find_by_id(id)
            .one(&self.db)
            .await
    }

    async  fn list_categories(&self) -> Result<Vec<CategoryModel>, DbErr> {
        CategoryEntity::find()
            .all(&self.db)
            .await
    }
}