use actix_web::{http::StatusCode, HttpResponse, ResponseError};
use serde::Serialize;
use std::fmt;

#[derive(Debug, Serialize)]
pub struct ApiErrorBody {
	pub message: String,
}

#[derive(Debug)]
pub enum ApiError {
	BadRequest(String),
	NotFound(String),
	Conflict(String),
	Internal(String),
}

impl fmt::Display for ApiError {
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
		write!(f, "{}", self.message())
	}
}

impl ApiError {
	pub fn bad_request(message: impl Into<String>) -> Self {
		Self::BadRequest(message.into())
	}

	pub fn not_found(message: impl Into<String>) -> Self {
		Self::NotFound(message.into())
	}

	pub fn conflict(message: impl Into<String>) -> Self {
		Self::Conflict(message.into())
	}

	pub fn internal(message: impl Into<String>) -> Self {
		Self::Internal(message.into())
	}

	pub fn message(&self) -> &str {
		match self {
			Self::BadRequest(message)
			| Self::NotFound(message)
			| Self::Conflict(message)
			| Self::Internal(message) => message,
		}
	}
}

impl ResponseError for ApiError {
	fn status_code(&self) -> StatusCode {
		match self {
			Self::BadRequest(_) => StatusCode::BAD_REQUEST,
			Self::NotFound(_) => StatusCode::NOT_FOUND,
			Self::Conflict(_) => StatusCode::CONFLICT,
			Self::Internal(_) => StatusCode::INTERNAL_SERVER_ERROR,
		}
	}

	fn error_response(&self) -> HttpResponse {
		HttpResponse::build(self.status_code()).json(ApiErrorBody {
			message: self.message().to_string(),
		})
	}
}

pub fn map_sqlx_error(error: sqlx::Error) -> ApiError {
	match &error {
		sqlx::Error::RowNotFound => ApiError::not_found("Registro no encontrado"),
		sqlx::Error::Database(db_err) => {
			let code = db_err.code().unwrap_or_default();

			// Common PostgreSQL error codes
			match code.as_ref() {
				"23503" => ApiError::bad_request("Referencia inválida (FK)"),
				"23505" => ApiError::conflict("Registro duplicado (UNIQUE)"),
				"23514" => ApiError::bad_request("Violación de restricción (CHECK)"),
				"22001" => ApiError::bad_request("Valor demasiado largo"),
				_ => ApiError::internal("Error de base de datos"),
			}
		}
		_ => ApiError::internal("Error inesperado"),
	}
}
