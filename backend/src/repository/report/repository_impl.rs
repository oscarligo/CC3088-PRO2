// src/repository/report/repository_impl.rs

use sea_orm::{
    DatabaseConnection, EntityTrait, QuerySelect, QueryFilter, QueryOrder,
    ColumnTrait, JoinType, RelationTrait, DbErr, Func, Expr, Order, SimpleExpr
};
use super::repository::ReportRepository;

// Modelos destino (analíticos y base)
use crate::models::client::{Entity as ClientEntity, Column as ClientColumn, Model as Client};
use crate::models::product::{Entity as ProductEntity, Column as ProductColumn, Model as InventoryProduct};
use crate::models::report::{CategorySales, SaleLine, SupplierProductCount, TopClient};

// Entidades necesarias para armar las relaciones (Asegúrate de que tus nombres coincidan con tus módulos)
use crate::models::sale::{Entity as SaleEntity, Column as SaleColumn};
use crate::models::sale_details::{Entity as DetailEntity, Column as DetailColumn};
use crate::models::supplier::{Entity as SupplierEntity, Column as SupplierColumn};
use crate::models::category::{Entity as CategoryEntity, Column as CategoryColumn};

pub struct ReportRepositoryImpl {
    pub db: DatabaseConnection,
}

impl ReportRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl ReportRepository for ReportRepositoryImpl {
    
    // 1. LIST SALE LINES (Múltiples INNER/LEFT JOINs + Multiplicación de columnas)
    async fn list_sale_lines(&self) -> Result<Vec<SaleLine>, DbErr> {
        // Expresión para calcular (amount * sale_price)
        let line_total_expr = Expr::col((DetailEntity, DetailColumn::Amount))
            .into_simple_expr()
            .mul(Expr::col((DetailEntity, DetailColumn::SalePrice)).into_simple_expr());

        SaleEntity::find()
            .select_only()
            .column(SaleColumn::IdSale)
            .expr_as(Expr::col(SaleColumn::Date).cast_as(sea_orm::sea_query::Alias::new("text")), "sale_date")
            .column_as(ClientColumn::Name, "client_name")
            .column_as(EmployeeColumn::Name, "employee_name")
            .column_as(ProductColumn::Name, "product_name")
            .column(DetailColumn::Amount)
            .column(DetailColumn::SalePrice)
            .expr_as(line_total_expr, "line_total")
            // Joins basados en las relaciones definidas en tus modelos
            .join(JoinType::InnerJoin, SaleEntity::Relation::SaleDetails.def())
            .join(JoinType::InnerJoin, DetailEntity::Relation::Product.def())
            .join(JoinType::LeftJoin, SaleEntity::Relation::Client.def())
            .join(JoinType::InnerJoin, SaleEntity::Relation::Employee.def())
            .order_by_asc(SaleColumn::IdSale)
            .order_by_asc(DetailColumn::IdSaleDetail)
            .into_model::<SaleLine>()
            .all(&self.db)
            .await
    }

    // 2. SUPPLIER PRODUCT COUNT (LEFT JOIN + GROUP BY + HAVING)
    async fn supplier_product_count(&self, min_products: i64) -> Result<Vec<SupplierProductCount>, DbErr> {
        SupplierEntity::find()
            .select_only()
            .column(SupplierColumn::IdSupplier)
            .column_as(SupplierColumn::Name, "supplier_name")
            .expr_as(Func::count(ProductColumn::IdProduct), "products_count")
            .expr_as(Func::avg(ProductColumn::UnitPrice), "avg_unit_price")
            .join(JoinType::LeftJoin, SupplierEntity::Relation::Product.def())
            .group_by(SupplierColumn::IdSupplier)
            .group_by(SupplierColumn::Name)
            .having(Func::count(ProductColumn::IdProduct).gte(min_products))
            .order_by_desc(Expr::cust("products_count"))
            .order_by_asc(SupplierColumn::Name)
            .into_model::<SupplierProductCount>()
            .all(&self.db)
            .await
    }

    // 3. CATEGORY SALES (SUM, COUNT DISTINCT y HAVING complejos)
    async fn category_sales(&self, min_total: f64) -> Result<Vec<CategorySales>, DbErr> {
        let revenue_expr = Expr::col((DetailEntity, DetailColumn::Amount))
            .into_simple_expr()
            .mul(Expr::col((DetailEntity, DetailColumn::SalePrice)).into_simple_expr());

        CategoryEntity::find()
            .select_only()
            .column(CategoryColumn::IdCategory)
            .column_as(CategoryColumn::Name, "category_name")
            .expr_as(Func::sum(DetailColumn::Amount), "items_sold")
            .expr_as(Func::count_distinct(DetailColumn::IdSale), "sales_count")
            .expr_as(Func::sum(revenue_expr.clone()), "total_revenue")
            // Cadena de Joins: Category -> Product -> SaleDetails -> Sale
            .join(JoinType::InnerJoin, CategoryEntity::Relation::Product.def())
            .join(JoinType::InnerJoin, ProductEntity::Relation::SaleDetails.def())
            .join(JoinType::InnerJoin, DetailEntity::Relation::Sale.def())
            .group_by(CategoryColumn::IdCategory)
            .group_by(CategoryColumn::Name)
            .having(Func::sum(revenue_expr).gte(min_total))
            .order_by_desc(Expr::cust("total_revenue"))
            .into_model::<CategorySales>()
            .all(&self.db)
            .await
    }

    // 4. UNSOLD PRODUCTS (Subconsulta con WHERE NOT EXISTS)
    async fn unsold_products(&self) -> Result<Vec<InventoryProduct>, DbErr> {
        // Si tienes mapeada tu vista 'vw_inventory' en SeaORM, úsala directamente.
        // Si no, aquí asumimos que InventoryProduct es tu modelo 'ProductEntity' mapeado.
        ProductEntity::find()
            .filter(
                // WHERE NOT EXISTS (SELECT 1 FROM sale_details WHERE sd.id_product = product.id_product)
                DetailEntity::find()
                    .select_only()
                    .expr(Expr::val(1))
                    .filter(DetailColumn::IdProduct.eq(ProductColumn::IdProduct))
                    .not_exists()
            )
            .order_by_asc(ProductColumn::IdProduct)
            .all(&self.db)
            .await
    }

    // 5. CLIENTS WITH MIN SALES (Subconsulta IN con GROUP BY + HAVING)
    async fn clients_with_min_sales(&self, min_sales: i64) -> Result<Vec<Client>, DbErr> {
        // Construimos la subconsulta interna
        let subquery = SaleEntity::find()
            .select_only()
            .column(SaleColumn::IdClient)
            .filter(SaleColumn::IdClient.is_not_null())
            .group_by(SaleColumn::IdClient)
            .having(Func::count(SaleColumn::IdSale).gte(min_sales));

        ClientEntity::find()
            .filter(ClientColumn::IdClient.in_subquery(subquery))
            .order_by_asc(ClientColumn::IdClient)
            .all(&self.db)
            .await
    }

    // 6. TOP CLIENTS (Agregaciones con LIMIT ordenadas por alias)
    async fn top_clients(&self, limit: i64) -> Result<Vec<TopClient>, DbErr> {
        let revenue_expr = Expr::col((DetailEntity, DetailColumn::Amount))
            .into_simple_expr()
            .mul(Expr::col((DetailEntity, DetailColumn::PriceAtSale)).into_simple_expr());

        ClientEntity::find()
            .select_only()
            .column(ClientColumn::IdClient)
            .column_as(ClientColumn::Name, "client_name")
            .expr_as(Func::sum(revenue_expr), "total_spent")
            .expr_as(Func::count_distinct(DetailColumn::IdSale), "sales_count")
            .join(JoinType::InnerJoin, ClientEntity::Relation::Sale.def())
            .join(JoinType::InnerJoin, SaleEntity::Relation::SaleDetails.def())
            .group_by(ClientColumn::IdClient)
            .group_by(ClientColumn::Name)
            .order_by_desc(Expr::cust("total_spent"))
            .limit(limit as u64)
            .into_model::<TopClient>()
            .all(&self.db)
            .await
    }
}