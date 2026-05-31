use sea_orm::{DatabaseConnection, EntityTrait, DbErr};
use super::repository::EmployeeRepository;
use crate::models::employee::{Entity as EmployeeEntity, Model as EmployeeModel};

pub struct EmployeeRepositoryImpl {
    pub db: DatabaseConnection,
}

impl EmployeeRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl EmployeeRepository for EmployeeRepositoryImpl {
    
    async fn get_employee(&self, id: i32) -> Result<Option<EmployeeModel>, DbErr> {
        // Usamos la entidad autogenerada de SeaORM para buscar en la tabla "employees"
        EmployeeEntity::find_by_id(id)
            .one(&self.db)
            .await
    }

    async fn list_employees(&self) -> Result<Vec<EmployeeModel>, DbErr> {
        EmployeeEntity::find()
            .all(&self.db)
            .await
    }
}