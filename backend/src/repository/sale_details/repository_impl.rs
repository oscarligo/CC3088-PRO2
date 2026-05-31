use sea_orm::{DatabaseConnection, EntityTrait, ActiveModelTrait, IntoActiveModel, Set, ColumnTrait, QueryFilter, DeleteResult};
use sea_orm::DbErr;
use super::repository::SaleDetailRepository;
use crate::models::sale_details::{Entity as DetailEntity, Model as SaleDetailModel, Column as DetailColumn};

pub struct SaleDetailRepositoryImpl {
    pub db: DatabaseConnection,
}

impl SaleDetailRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl SaleDetailRepository for SaleDetailRepositoryImpl {
    
    async fn get_detail(&self, id: i32) -> Result<Option<SaleDetailModel>, DbErr> {
        DetailEntity::find_by_id(id).one(&self.db).await
    }

    async fn list_by_sale(&self, sale_id: i32) -> Result<Vec<SaleDetailModel>, DbErr> {
        DetailEntity::find()
            .filter(DetailColumn::IdSale.eq(sale_id)) 
            .all(&self.db)
            .await
    }

    async fn update_detail(&self, id: i32, detail_data: SaleDetailModel) -> Result<SaleDetailModel, DbErr> {
        let mut active_model = detail_data.into_active_model();
        active_model.id_sale_detail = Set(id);
        
        active_model.update(&self.db).await
    }

    async fn delete_detail(&self, id: i32) -> Result<(), DbErr> {
        let result: DeleteResult = DetailEntity::delete_by_id(id).exec(&self.db).await?;
        
        if result.rows_affected == 0 {
            return Err(DbErr::RecordNotFound("Sale detail line not found".to_owned()));
        }
        
        Ok(())
    }
}