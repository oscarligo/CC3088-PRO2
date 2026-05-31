use sea_orm::DbErr;
use crate::models::sale::Model as SaleModel;
use crate::models::sale_details::Model as SaleDetailModel;

pub trait SaleRepository {
    async fn create_sale(
        &self, 
        sale_data: SaleModel, 
        details: Vec<SaleDetailModel>
    ) -> Result<(SaleModel, Vec<SaleDetailModel>), DbErr>;

    async fn list_sales(&self) -> Result<Vec<(SaleModel, Vec<SaleDetailModel>)>, DbErr>;
    async fn get_sale(&self, id: i32) -> Result<Option<(SaleModel, Vec<SaleDetailModel>)>, DbErr>;
    async fn update_sale(&self, id: i32, sale_data: SaleModel) -> Result<SaleModel, DbErr>;
    async fn delete_sale(&self, id: i32) -> Result<(), DbErr>;
}