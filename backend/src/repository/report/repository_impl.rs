use sea_orm::{
    sea_query::{Alias, Expr, ExprTrait, Func},
    ColumnTrait, DatabaseConnection, DbErr, EntityTrait, JoinType, QueryFilter, QueryOrder,
    QuerySelect, RelationTrait,
};

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

    async fn category_sales(&self, min_total: f64) -> Result<Vec<CategorySales>, DbErr> {
        let revenue_expr = Expr::col((DetailEntity, DetailColumn::Amount))
            .mul(Expr::col((DetailEntity, DetailColumn::SalePrice)));

        CategoryEntity::find()
            .select_only()
            .column(CategoryColumn::IdCategory)
            .column_as(CategoryColumn::Name, "category_name")
            .expr_as(Expr::col((DetailEntity, DetailColumn::Amount)).sum(), "items_sold")
            .expr_as(
                Expr::col((DetailEntity, DetailColumn::IdSale)).count_distinct(),
                "sales_count",
            )
            .expr_as(Func::sum(revenue_expr.clone()), "total_revenue")
            .join(JoinType::InnerJoin, category::Relation::Product.def())
            .join(JoinType::InnerJoin, product::Relation::SaleDetails.def())
            .join(JoinType::InnerJoin, sale_details::Relation::Sale.def())
            .group_by(CategoryColumn::IdCategory)
            .group_by(CategoryColumn::Name)
            .having(Func::sum(revenue_expr).gte(min_total))
            .order_by_desc(Expr::cust("total_revenue"))
            .into_model::<CategorySales>()
            .all(&self.db)
            .await
    }

    async fn unsold_products(&self) -> Result<Vec<InventoryItem>, DbErr> {
        ProductEntity::find()
            .select_only()
            .column(ProductColumn::IdProduct)
            .column_as(ProductColumn::Name, "product_name")
            .column(ProductColumn::UnitPrice)
            .column(ProductColumn::Stock)
            .column(ProductColumn::IdCategory)
            .column_as(CategoryColumn::Name, "category_name")
            .column(ProductColumn::IdSupplier)
            .column_as(SupplierColumn::Name, "supplier_name")
            .join(JoinType::InnerJoin, product::Relation::Category.def())
            .join(JoinType::InnerJoin, product::Relation::Supplier.def())
            .join(JoinType::LeftJoin, product::Relation::SaleDetails.def())
            .filter(DetailColumn::IdSaleDetail.is_null())
            .distinct()
            .order_by_asc(ProductColumn::IdProduct)
            .into_model::<InventoryItem>()
            .all(&self.db)
            .await
    }

    async fn clients_with_min_sales(&self, min_sales: i64) -> Result<Vec<Client>, DbErr> {
        ClientEntity::find()
            .select_only()
            .column(ClientColumn::IdClient)
            .column(ClientColumn::Name)
            .column(ClientColumn::Nit)
            .column(ClientColumn::Email)
            .join(JoinType::InnerJoin, client::Relation::Sale.def())
            .group_by(ClientColumn::IdClient)
            .group_by(ClientColumn::Name)
            .group_by(ClientColumn::Nit)
            .group_by(ClientColumn::Email)
            .having(Expr::col((SaleEntity, SaleColumn::IdSale)).count().gte(min_sales))
            .order_by_asc(ClientColumn::IdClient)
            .into_model::<Client>()
            .all(&self.db)
            .await
    }

    async fn top_clients(&self, limit: i64) -> Result<Vec<TopClient>, DbErr> {
        let revenue_expr = Expr::col((DetailEntity, DetailColumn::Amount))
            .mul(Expr::col((DetailEntity, DetailColumn::SalePrice)));

        ClientEntity::find()
            .select_only()
            .column(ClientColumn::IdClient)
            .column_as(ClientColumn::Name, "client_name")
            .expr_as(Func::sum(revenue_expr), "total_spent")
            .expr_as(
                Expr::col((DetailEntity, DetailColumn::IdSale)).count_distinct(),
                "sales_count",
            )
            .join(JoinType::InnerJoin, client::Relation::Sale.def())
            .join(JoinType::InnerJoin, sale::Relation::SaleDetails.def())
            .group_by(ClientColumn::IdClient)
            .group_by(ClientColumn::Name)
            .order_by_desc(Expr::cust("total_spent"))
            .limit(limit as u64)
            .into_model::<TopClient>()
            .all(&self.db)
            .await
    }
}
