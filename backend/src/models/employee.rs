use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "employee")] 
pub struct Model {
    #[sea_orm(primary_key, column_name = "id_employee")]
    pub id_employee: i32,
    pub name: String,
    pub role: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::sale::Entity")]
    Sale,
}

impl Related<super::sale::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Sale.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}