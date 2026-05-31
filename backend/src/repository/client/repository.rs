use sea_orm::DbErr;
use crate::models::client::Model as ClientModel;

pub trait ClientRepository {
    async fn get_client(&self, id: i32) -> Result<Option<ClientModel>, DbErr>;
    async fn list_clients(&self) -> Result<Vec<ClientModel>, DbErr>;
}