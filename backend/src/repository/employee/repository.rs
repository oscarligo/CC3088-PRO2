use sea_orm::DbErr;
use crate::models::employee::Model as EmployeeModel;

pub trait EmployeeRepository {
    async fn get_employee(&self, id: i32) -> Result<Option<EmployeeModel>, DbErr>;
    async fn list_employees(&self) -> Result<Vec<EmployeeModel>, DbErr>;
}