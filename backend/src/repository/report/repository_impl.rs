use sea_orm::{
    sea_query::{Alias, Expr, ExprTrait, Func},
    ColumnTrait, DatabaseConnection, DbErr, EntityTrait, JoinType, QueryFilter, QueryOrder,
    QuerySelect, RelationTrait, DbBackend, Statement, ConnectionTrait
};
use serde::Deserialize;


use super::repository::ReportRepository;
use crate::models::category::{self, Column as CategoryColumn, Entity as CategoryEntity};
use crate::models::inventory::Model as InventoryItem;
use crate::models::client::{self, Column as ClientColumn, Entity as ClientEntity, Model as Client};
use crate::models::employee::Column as EmployeeColumn;
use crate::models::product::{
    self, Column as ProductColumn, Entity as ProductEntity,
};
use crate::models::report::{CategorySales, SaleLine, SupplierProductCount, TopClient};
use crate::models::sale::{self, Column as SaleColumn, Entity as SaleEntity};
use crate::models::sale_details::{self, Column as DetailColumn, Entity as DetailEntity};
use crate::models::supplier::{self, Column as SupplierColumn, Entity as SupplierEntity};

pub struct ReportRepositoryImpl {
    pub db: DatabaseConnection,
}

impl ReportRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl ReportRepository for ReportRepositoryImpl {
    async fn list_sale_lines(&self) -> Result<Vec<SaleLine>, DbErr> {
        let line_total_expr = Expr::col((DetailEntity, DetailColumn::Amount))
            .mul(Expr::col((DetailEntity, DetailColumn::SalePrice)));

        SaleEntity::find()
            .select_only()
            .column(SaleColumn::IdSale)
            .expr_as(
                Expr::col((SaleEntity, SaleColumn::SaleDate)).cast_as(Alias::new("text")),
                "sale_date",
            )
            .column_as(ClientColumn::Name, "client_name")
            .column_as(EmployeeColumn::Name, "employee_name")
            .column_as(ProductColumn::Name, "product_name")
            .column(DetailColumn::Amount)
            .column_as(DetailColumn::SalePrice, "sale_price")
            .expr_as(line_total_expr, "line_total")
            .join(JoinType::InnerJoin, sale::Relation::SaleDetails.def())
            .join(JoinType::InnerJoin, sale_details::Relation::Product.def())
            .join(JoinType::LeftJoin, sale::Relation::Client.def())
            .join(JoinType::InnerJoin, sale::Relation::Employee.def())
            .order_by_asc(SaleColumn::IdSale)
            .order_by_asc(DetailColumn::IdSaleDetail)
            .into_model::<SaleLine>()
            .all(&self.db)
            .await
    }

    async fn supplier_product_count(&self, min_products: i64) -> Result<Vec<SupplierProductCount>, DbErr> {
        let products_count_expr = Expr::col((ProductEntity, ProductColumn::IdProduct)).count();

        SupplierEntity::find()
            .select_only()
            .column(SupplierColumn::IdSupplier)
            .column_as(SupplierColumn::Name, "supplier_name")
            .expr_as(products_count_expr.clone(), "products_count")
            .expr_as(
                Func::avg(Expr::col((ProductEntity, ProductColumn::UnitPrice))),
                "avg_unit_price",
            )
            .join(JoinType::LeftJoin, supplier::Relation::Product.def())
            .group_by(SupplierColumn::IdSupplier)
            .group_by(SupplierColumn::Name)
            .having(products_count_expr.gte(min_products))
            .order_by_desc(Expr::cust("products_count"))
            .order_by_asc(SupplierColumn::Name)
            .into_model::<SupplierProductCount>()
            .all(&self.db)
            .await
    }

    async fn category_sales(&self, _min_total: f64) -> Result<Vec<CategorySales>, DbErr> {
        let stmt = Statement::from_string(
            DbBackend::Postgres,
            "CALL sp_reporte_ventas_categoria(NULL);".to_string(),
        );

        match self.db.query_one(stmt).await? {
            Some(row) => {
                let json_string: Option<String> = row.try_get("", "p_json_resultado").unwrap_or(None);
                if let Some(json_str) = json_string {
                    if json_str == "[]" || json_str.trim().is_empty() {
                        return Ok(vec![]);
                    }
                    let data: Vec<CategorySales> = serde_json::from_str(&json_str)
                        .map_err(|e| DbErr::Custom(format!("Error serializando SP Ventas Categoría: {}", e)))?;
                    Ok(data)
                } else {
                    Ok(vec![])
                }
            }
            None => Ok(vec![]),
        }
    }

    // ============================================================================
    // REQUISITO PROCEDURE 5 ➔ Mapeado a: unsold_products
    // ============================================================================
    async fn unsold_products(&self) -> Result<Vec<InventoryItem>, DbErr> {
        let stmt = Statement::from_string(
            DbBackend::Postgres,
            "CALL sp_productos_sin_ventas(NULL);".to_string(),
        );

        match self.db.query_one(stmt).await? {
            Some(row) => {
                let json_string: Option<String> = row.try_get("", "p_json_resultado").unwrap_or(None);
                if let Some(json_str) = json_string {

                    println!("DUMP JSON DESDE POSTGRES ➔: {}", json_str);
                    
                    if json_str == "[]" || json_str.trim().is_empty() {
                        return Ok(vec![]);
                    }
                    let data: Vec<InventoryItem> = serde_json::from_str(&json_str)
                        .map_err(|e| DbErr::Custom(format!("Error serializando SP Productos Sin Ventas: {}", e)))?;
                    Ok(data)
                } else {
                    Ok(vec![])
                }
            }
            None => Ok(vec![]),
        }
    }

    // ============================================================================
    // REQUISITO PROCEDURE 4 ➔ Mapeado a: clients_with_min_sales
    // ============================================================================
    async fn clients_with_min_sales(&self, _min_sales: i64) -> Result<Vec<Client>, DbErr> {
        let stmt = Statement::from_string(
            DbBackend::Postgres,
            "CALL sp_clientes_frecuentes(NULL);".to_string(),
        );

        match self.db.query_one(stmt).await? {
            Some(row) => {
                let json_string: Option<String> = row.try_get("", "p_json_resultado").unwrap_or(None);
                if let Some(json_str) = json_string {
                    if json_str == "[]" || json_str.trim().is_empty() {
                        return Ok(vec![]);
                    }
                    let data: Vec<Client> = serde_json::from_str(&json_str)
                        .map_err(|e| DbErr::Custom(format!("Error serializando SP Clientes Frecuentes: {}", e)))?;
                    Ok(data)
                } else {
                    Ok(vec![])
                }
            }
            None => Ok(vec![]),
        }
    }

    // ============================================================================
    // REQUISITO PROCEDURE 2 ➔ Mapeado a: top_clients
    // ============================================================================
    async fn top_clients(&self, _limit: i64) -> Result<Vec<TopClient>, DbErr> {
        let stmt = Statement::from_string(
            DbBackend::Postgres,
            "CALL sp_reporte_top_productos(NULL);".to_string(),
        );

        match self.db.query_one(stmt).await? {
            Some(row) => {
                let json_string: Option<String> = row.try_get("", "p_json_resultado").unwrap_or(None);
                if let Some(json_str) = json_string {
                    if json_str == "[]" || json_str.trim().is_empty() {
                        return Ok(vec![]);
                    }
                    let data: Vec<TopClient> = serde_json::from_str(&json_str)
                        .map_err(|e| DbErr::Custom(format!("Error serializando SP Top Productos: {}", e)))?;
                    Ok(data)
                } else {
                    Ok(vec![])
                }
            }
            None => Ok(vec![]),
        }
    }
}
