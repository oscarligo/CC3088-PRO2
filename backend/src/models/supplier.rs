use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "supplier")] // Nombre de la tabla en tu base de datos
pub struct Model {
    #[sea_orm(primary_key, column_name = "id_supplier")]
    #[serde(skip_deserializing)]
    pub id_supplier: i32,
    pub name: String,
    pub email: Option<String>,
    pub phone: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::product::Entity")]
    Product,
}

impl Related<super::product::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Product.def()
    }
}


impl ActiveModelBehavior for ActiveModel {}