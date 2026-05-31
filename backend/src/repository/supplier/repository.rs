use sea_orm::DbErr;
use crate::models::supplier::Model as SupplierModel;

pub trait SupplierRepository {
    async fn create_supplier(&self, supplier_data: SupplierModel) -> Result<SupplierModel, DbErr>;
    async fn list_suppliers(&self) -> Result<Vec<SupplierModel>, DbErr>;
    async fn get_supplier(&self, id: i32) -> Result<Option<SupplierModel>, DbErr>;
    async fn update_supplier(&self, id: i32, supplier_data: SupplierModel) -> Result<SupplierModel, DbErr>;
    async fn delete_supplier(&self, id: i32) -> Result<(), DbErr>;
}