use sea_orm::{
    ActiveModelTrait, ColumnTrait, DatabaseConnection, DbErr, DeleteResult, EntityTrait,
    IntoActiveModel, QueryFilter, Set, TransactionTrait, Statement, DbBackend, ConnectionTrait
};

use super::repository::SaleRepository;
use crate::models::sale::{self, Entity as SaleEntity, Model as SaleModel};
use crate::models::sale_details::{Entity as DetailEntity, Model as SaleDetailModel};
use rust_decimal::Decimal;

pub struct SaleRepositoryImpl {
    pub db: DatabaseConnection,
}

impl SaleRepositoryImpl {
    pub fn new(db: DatabaseConnection) -> Self {
        Self { db }
    }
}

impl SaleRepository for SaleRepositoryImpl {
    
    async fn create_sale(
        &self, 
        id_client: Option<i32>,
        id_employee: i32,
        details: Vec<SaleDetailModel>
    ) -> Result<(SaleModel, Vec<SaleDetailModel>), DbErr> {
        
        // 1. Validación defensiva en el backend
        if details.is_empty() {
            return Err(DbErr::Custom("No se puede registrar una venta sin detalles".to_string()));
        }

        // Tomamos el primer producto para el procedimiento parametrizado
        let first_detail = &details[0];

        // 2. Preparar la sentencia nativa CALL con los parámetros IN y marcadores OUT vacíos
        let sql = "CALL sp_registrar_venta_transaccional($1, $2, $3, $4, $5, NULL, NULL, NULL);";
        
        let stmt = Statement::from_sql_and_values(
            DbBackend::Postgres,
            sql,
            vec![
                id_client.into(),
                id_employee.into(),
                first_detail.id_product.into(),
                first_detail.amount.into(),
                first_detail.sale_price.into(), 
            ],
        );

        // 3. Ejecutar el procedimiento en el DBMS
        match self.db.query_one(stmt).await? {
            Some(row) => {
                // Recuperamos las variables OUT usando el índice posicional (0, 1, 2)
                let id_sale_generado: Option<i32> = row.try_get_by_index(0).unwrap_or(None);
                

                // 5. Construir los objetos de retorno para mantener la compatibilidad con el Handler / Frontend
                let saved_sale = SaleModel {
                    id_sale: id_sale_generado.unwrap_or(0),
                    id_client,
                    id_employee,
                    sale_date: chrono::Local::now().naive_local(), 
    
                };

                let mut saved_details = Vec::new();
                saved_details.push(SaleDetailModel {
                    id_sale_detail: 0, // El ID real lo autogeneró el SERIAL de Postgres
                    id_sale: id_sale_generado.unwrap_or(0),
                    id_product: first_detail.id_product,
                    amount: first_detail.amount,
                    sale_price: first_detail.sale_price,
                });

                Ok((saved_sale, saved_details))
            }
            None => Err(DbErr::Custom("El motor de base de datos no retornó ninguna fila de control.".to_string())),
        }
    }

    async fn list_sales(&self) -> Result<Vec<(SaleModel, Vec<SaleDetailModel>)>, DbErr> {
        // SeaORM jala la venta junto con sus detalles mapeados gracias a la relación has_many
        SaleEntity::find()
            .find_with_related(DetailEntity)
            .all(&self.db)
            .await
    }

    async fn get_sale(&self, id: i32) -> Result<Option<(SaleModel, Vec<SaleDetailModel>)>, DbErr> {
        let rows = SaleEntity::find_by_id(id)
            .find_with_related(DetailEntity)
            .all(&self.db)
            .await?;
        Ok(rows.into_iter().next())
    }

    async fn update_sale(&self, id: i32, sale_data: SaleModel) -> Result<SaleModel, DbErr> {
        let mut active_model = sale_data.into_active_model();
        active_model.id_sale = Set(id);
        
        active_model.update(&self.db).await
    }

    async fn delete_sale(&self, id: i32) -> Result<(), DbErr> {
        let txn = self.db.begin().await?; 
        DetailEntity::delete_many()
            .filter(crate::models::sale_details::Column::IdSale.eq(id))
            .exec(&txn)
            .await?;
        let result: DeleteResult = SaleEntity::delete_by_id(id).exec(&txn).await?;        
        if result.rows_affected == 0 {
            return Err(DbErr::RecordNotFound("Sale not found".to_owned()));
        }
        txn.commit().await?;
        Ok(())
    }
}