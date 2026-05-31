use sea_orm::DbErr;
use crate::models::sale_details::Model as SaleDetailModel;

pub trait SaleDetailRepository {
    async fn get_detail(&self, id: i32) -> Result<Option<SaleDetailModel>, DbErr>;
    async fn list_by_sale(&self, sale_id: i32) -> Result<Vec<SaleDetailModel>, DbErr>;
    async fn update_detail(&self, id: i32, detail_data: SaleDetailModel) -> Result<SaleDetailModel, DbErr>;
    async fn delete_detail(&self, id: i32) -> Result<(), DbErr>;
}