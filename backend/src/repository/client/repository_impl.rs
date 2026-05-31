use sea_orm::{DatabaseConnection, EntityTrait, DbErr};
use super::repository::ClientRepository;
use crate::models::client::{Entity as ClientEntity, Model as ClientModel};

pub struct ClientRepositoryImpl {
    pub db: DatabaseConnection,
}

// Constructor for inyecting the database connection into the repository implementation
impl ClientRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl ClientRepository for ClientRepositoryImpl {
    
    async fn get_client(&self, id: i32) -> Result<Option<ClientModel>, DbErr> {
        ClientEntity::find_by_id(id)
            .one(&self.db)
            .await
    }

    async fn list_clients(&self) -> Result<Vec<ClientModel>, DbErr> {
        ClientEntity::find()
            .all(&self.db)
            .await  
    }
}