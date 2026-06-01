use sea_orm::{ActiveModelTrait, DatabaseConnection, DbErr, DeleteResult, EntityTrait, IntoActiveModel, Set, ActiveValue};
use super::repository::ProductRepository;
use crate::models::inventory::{Entity as InventoryEntity, Model as InventoryItem};
use crate::models::product::{Entity as ProductEntity, Model as ProductModel};

pub struct ProductRepositoryImpl {
    pub db: DatabaseConnection,
}

impl ProductRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl ProductRepository for ProductRepositoryImpl {
    
    async fn create_product(&self, product_data: ProductModel) -> Result<ProductModel, DbErr> {
        let mut active_model = product_data.into_active_model();        
        active_model.id_product = ActiveValue::NotSet;
        active_model.insert(&self.db).await
    }

    async fn list_products(&self) -> Result<Vec<ProductModel>, DbErr> {
        ProductEntity::find().all(&self.db).await
    }

    async fn list_inventory(&self) -> Result<Vec<InventoryItem>, DbErr> {
        InventoryEntity::find().all(&self.db).await
    }

    async fn get_product(&self, id: i32) -> Result<Option<ProductModel>, DbErr> {
        ProductEntity::find_by_id(id).one(&self.db).await
    }

    async fn update_product(&self, id: i32, product_data: ProductModel) -> Result<ProductModel, DbErr> {
        let mut active_model = product_data.into_active_model();       
        active_model.id_product = Set(id);
        active_model.update(&self.db).await
    }

    // D - DELETE
    async fn delete_product(&self, id: i32) -> Result<(), DbErr> {
        let result: DeleteResult = ProductEntity::delete_by_id(id).exec(&self.db).await?;        
        if result.rows_affected == 0 {
            return Err(DbErr::RecordNotFound("Product not found".to_owned()));
        }
        Ok(())
    }
}