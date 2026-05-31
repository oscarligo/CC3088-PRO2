use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "products")]
pub struct Model {
    #[sea_orm(primary_key, column_name = "id_product")]
    #[serde(skip_deserializing)] 
    pub id_product: i32,
    pub name: String,
    pub unit_price: f64, 
    pub stock: i32,
    pub id_category: i32,
    pub id_supplier: i32,
}

// Aquí definirás las relaciones en el futuro para evitar el "InventoryProduct"
#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::category::Entity",
        from = "Column::IdCategory",
        to = "super::category::Column::IdCategory"
    )]
    Category,
    #[sea_orm(
        belongs_to = "super::supplier::Entity",
        from = "Column::IdSupplier",
        to = "super::supplier::Column::IdSupplier"
    )]
    Supplier,
    #[sea_orm(has_many = "super::sale_details::Entity")]
    SaleDetails,
}

impl Related<super::category::Entity> for Entity {
    fn to() -> RelationDef { Relation::Category.def() }
}
impl Related<super::supplier::Entity> for Entity {
    fn to() -> RelationDef { Relation::Supplier.def() }
}
impl Related<super::sale_details::Entity> for Entity {
    fn to() -> RelationDef { Relation::SaleDetails.def() }
}

impl ActiveModelBehavior for ActiveModel {}