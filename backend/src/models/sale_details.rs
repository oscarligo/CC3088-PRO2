use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "sale_details")]
pub struct Model {
    #[sea_orm(primary_key, column_name = "id_sale_detail")]
    #[serde(skip_deserializing)] 
    pub id_sale_detail: i32,
    pub id_sale: i32,    
    pub id_product: i32, 
    pub amount: i32,
    pub sale_price: f64, 
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        fk_name = "fk_sale_details_sale",
        belongs_to = "super::sale::Entity",
        from = "Column::IdSale",
        to = "super::sale::Column::IdSale"
    )]
    Sale,
    #[sea_orm(
        fk_name = "fk_sale_details_product",
        belongs_to = "super::product::Entity",
        from = "Column::IdProduct",
        to = "super::product::Column::IdProduct"
    )]
    Product,
}

impl Related<super::sale::Entity> for Entity {
    fn to() -> RelationDef { Relation::Sale.def() }
}
impl Related<super::product::Entity> for Entity {
    fn to() -> RelationDef { Relation::Product.def() }
}

impl ActiveModelBehavior for ActiveModel {}