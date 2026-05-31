use sea_orm::{
    DatabaseConnection, EntityTrait, ActiveModelTrait, IntoActiveModel, 
    Set, TransactionTrait, DbErr, DeleteResult, ColumnTrait, QueryFilter
};

use super::repository::SaleRepository;
use crate::models::sale::{Entity as SaleEntity, Model as SaleModel};
use crate::models::sale_details::{Entity as DetailEntity, Model as SaleDetailModel};

pub struct SaleRepositoryImpl {
    pub db: DatabaseConnection,
}

impl SaleRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl SaleRepository for SaleRepositoryImpl {
    
    async fn create_sale(
        &self, 
        sale_data: SaleModel, 
        details: Vec<SaleDetailModel>
    ) -> Result<(SaleModel, Vec<SaleDetailModel>), DbErr> {
        
        let txn = self.db.begin().await?;

        let mut sale_active = sale_data.into_active_model();
        sale_active.id_sale = Set(0); // Forzar autoincrementable
        
        let saved_sale = sale_active.insert(&txn).await?;
        let generated_sale_id = saved_sale.id_sale;

        let mut saved_details = Vec::new();
        for detail in details {
            let mut detail_active = detail.into_active_model();
            detail_active.id_sale_detail = Set(0);
            detail_active.id_sale = Set(generated_sale_id); // Inyectamos el ID padre

            let saved_detail = detail_active.insert(&txn).await?;
            saved_details.push(saved_detail);
        }

        txn.commit().await?;

        Ok((saved_sale, saved_details))
    }

    async fn list_sales(&self) -> Result<Vec<(SaleModel, Vec<SaleDetailModel>)>, DbErr> {
        // SeaORM jala la venta junto con sus detalles mapeados gracias a la relación has_many
        SaleEntity::find()
            .find_with_related(DetailEntity)
            .all(&self.db)
            .await
    }

    async fn get_sale(&self, id: i32) -> Result<Option<(SaleModel, Vec<SaleDetailModel>)>, DbErr> {
        let rows = SaleEntity::find_by_id(id)
            .find_with_related(DetailEntity)
            .all(&self.db)
            .await?;
        Ok(rows.into_iter().next())
    }

    async fn update_sale(&self, id: i32, sale_data: SaleModel) -> Result<SaleModel, DbErr> {
        let mut active_model = sale_data.into_active_model();
        active_model.id_sale = Set(id);
        
        active_model.update(&self.db).await
    }

    async fn delete_sale(&self, id: i32) -> Result<(), DbErr> {
        let txn = self.db.begin().await?; 
        DetailEntity::delete_many()
            .filter(crate::models::sale_details::Column::IdSale.eq(id))
            .exec(&txn)
            .await?;
        let result: DeleteResult = SaleEntity::delete_by_id(id).exec(&txn).await?;        
        if result.rows_affected == 0 {
            return Err(DbErr::RecordNotFound("Sale not found".to_owned()));
        }
        txn.commit().await?;
        Ok(())
    }
}