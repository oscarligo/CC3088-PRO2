use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "clients")] 
pub struct Model {
    #[sea_orm(primary_key, column_name = "id_client")]
    pub id_client: i32,
    pub name: String,
    pub nit: Option<String>,
    pub email: Option<String>,
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