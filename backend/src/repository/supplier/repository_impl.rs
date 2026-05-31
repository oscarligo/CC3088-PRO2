use sea_orm::{DatabaseConnection, EntityTrait, ActiveModelTrait, IntoActiveModel, Set, DeleteResult};
use sea_orm::DbErr;
use super::repository::SupplierRepository;
use crate::models::supplier::{Entity as SupplierEntity, Model as SupplierModel};

pub struct SupplierRepositoryImpl {
    pub db: DatabaseConnection,
}

impl SupplierRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl SupplierRepository for SupplierRepositoryImpl {
    
    async fn create_supplier(&self, supplier_data: SupplierModel) -> Result<SupplierModel, DbErr> {
        let mut active_model = supplier_data.into_active_model();
        active_model.id_supplier = Set(0); 
        active_model.insert(&self.db).await
    }

    async fn list_suppliers(&self) -> Result<Vec<SupplierModel>, DbErr> {
        SupplierEntity::find().all(&self.db).await
    }

    async fn get_supplier(&self, id: i32) -> Result<Option<SupplierModel>, DbErr> {
        SupplierEntity::find_by_id(id).one(&self.db).await
    }

    async fn update_supplier(&self, id: i32, supplier_data: SupplierModel) -> Result<SupplierModel, DbErr> {
        let mut active_model = supplier_data.into_active_model();
        
        active_model.id_supplier = Set(id);

        active_model.update(&self.db).await
    }

    async fn delete_supplier(&self, id: i32) -> Result<(), DbErr> {
        let result: DeleteResult = SupplierEntity::delete_by_id(id).exec(&self.db).await?;
        
        if result.rows_affected == 0 {
            return Err(DbErr::RecordNotFound("Supplier not found".to_owned()));
        }
        
        Ok(())
    }
}