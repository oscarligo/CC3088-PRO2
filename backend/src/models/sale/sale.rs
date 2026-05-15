use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateSaleItemRequest {
    pub id_product: i32,
    pub amount: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateSaleRequest {
    pub id_client: Option<i32>,
    pub id_employee: i32,
    pub items: Vec<CreateSaleItemRequest>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateSaleResponse {
    pub id_sale: i32,
}
