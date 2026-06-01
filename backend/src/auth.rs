use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use sea_orm::Database;
use serde::{Deserialize, Serialize};
use std::env;
use url::Url;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AppRole {
    Admin,
    Cajero,
    Inventario,
    Analista,
    Auditor,
}

impl AppRole {
    pub fn from_login_username(username: &str) -> Option<Self> {
        match username {
            "user_master_admin" => Some(Self::Admin),
            "user_cajero" => Some(Self::Cajero),
            "user_inventario" => Some(Self::Inventario),
            "user_analista" => Some(Self::Analista),
            "user_auditor" => Some(Self::Auditor),
            _ => None,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct SessionClaims {
    sub: String,
    role: AppRole,
    exp: usize,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub username: String,
    pub role: AppRole,
    pub expires_at: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct SessionUser {
    pub username: String,
    pub role: AppRole,
}

fn jwt_secret() -> String {
    env::var("JWT_SECRET").unwrap_or_else(|_| "cc3088-pro2-dev-secret".to_string())
}

fn build_login_url(base_database_url: &str, username: &str, password: &str) -> Result<String, String> {
    let mut url = Url::parse(base_database_url).map_err(|_| "DATABASE_URL invalida".to_string())?;
    url.set_username(username).map_err(|_| "No se pudo aplicar el usuario".to_string())?;
    url.set_password(Some(password))
        .map_err(|_| "No se pudo aplicar la contraseña".to_string())?;
    Ok(url.to_string())
}

fn encode_session(username: &str, role: AppRole) -> Result<LoginResponse, String> {
    let exp = Utc::now() + Duration::hours(8);
    let claims = SessionClaims {
        sub: username.to_string(),
        role,
        exp: exp.timestamp() as usize,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret().as_bytes()),
    )
    .map_err(|_| "No se pudo generar el token".to_string())?;

    Ok(LoginResponse {
        token,
        username: username.to_string(),
        role,
        expires_at: exp.to_rfc3339(),
    })
}

pub async fn login_with_database_credentials(
    database_url: &str,
    username: &str,
    password: &str,
) -> Result<LoginResponse, String> {
    let role = AppRole::from_login_username(username)
        .ok_or_else(|| "Usuario no permitido".to_string())?;
    let login_url = build_login_url(database_url, username, password)?;

    Database::connect(login_url)
        .await
        .map_err(|_| "Credenciales incorrectas".to_string())?;

    encode_session(username, role)
}

fn decode_session(token: &str) -> Result<SessionClaims, String> {
    decode::<SessionClaims>(
        token,
        &DecodingKey::from_secret(jwt_secret().as_bytes()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|_| "Token invalido".to_string())
}

pub fn extract_session(
    req: &actix_web::HttpRequest,
    allowed_roles: &[AppRole],
) -> Result<SessionUser, actix_web::HttpResponse> {
    let Some(header_value) = req.headers().get(actix_web::http::header::AUTHORIZATION) else {
        return Err(actix_web::HttpResponse::Unauthorized().json("Falta autorizacion"));
    };

    let Ok(header_text) = header_value.to_str() else {
        return Err(actix_web::HttpResponse::Unauthorized().json("Autorizacion invalida"));
    };

    let Some(token) = header_text.strip_prefix("Bearer ") else {
        return Err(actix_web::HttpResponse::Unauthorized().json("Token faltante"));
    };

    let claims = match decode_session(token) {
        Ok(claims) => claims,
        Err(message) => return Err(actix_web::HttpResponse::Unauthorized().json(message)),
    };

    if claims.role != AppRole::Admin && !allowed_roles.contains(&claims.role) {
        return Err(actix_web::HttpResponse::Forbidden().json("No autorizado para esta accion"));
    }

    Ok(SessionUser {
        username: claims.sub,
        role: claims.role,
    })
}