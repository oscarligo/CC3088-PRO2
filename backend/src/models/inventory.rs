use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "vw_inventory")]
pub struct Model {
    #[sea_orm(primary_key, column_name = "id_product")]
    pub id_product: i32,
    pub product_name: String,
    pub unit_price: Decimal,
    pub stock: i32,
    pub id_category: i32,
    pub category_name: String,
    pub id_supplier: i32,
    pub supplier_name: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}

pub type InventoryItem = Model;
