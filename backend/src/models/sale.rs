use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "sale")]
pub struct Model {
    #[sea_orm(primary_key, column_name = "id_sale")]
    #[serde(skip_deserializing)] 
    pub id_sale: i32,   
    pub id_client: Option<i32>, 
    pub id_employee: i32,   
    #[sea_orm(default_value = "expr:NOW()")] 
    pub date: DateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::client::Entity",
        from = "Column::IdClient",
        to = "super::client::Column::IdClient"
    )]
    Client,
    #[sea_orm(
        belongs_to = "super::employee::Entity",
        from = "Column::IdEmployee",
        to = "super::employee::Column::IdEmployee"
    )]
    Employee,
    #[sea_orm(has_many = "super::sale_details::Entity")]
    SaleDetails,
}

impl Related<super::client::Entity> for Entity {
    fn to() -> RelationDef { Relation::Client.def() }
}
impl Related<super::employee::Entity> for Entity {
    fn to() -> RelationDef { Relation::Employee.def() }
}
impl Related<super::sale_details::Entity> for Entity {
    fn to() -> RelationDef { Relation::SaleDetails.def() }
}

impl ActiveModelBehavior for ActiveModel {}