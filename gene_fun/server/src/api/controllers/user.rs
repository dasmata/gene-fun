use std::sync::Arc;
use axum::{Extension, Json, Router};
use axum::http::StatusCode;
use axum::routing::{get};
use crate::api::AppState;
use crate::api::models::User::{User};

#[path = "../models/User.rs"]
mod user;

    pub fn get_router(Extension(state): Extension<Arc<AppState>>) -> Router {
        Router::new()
            .route("/", get(get_current))
            // .route("/", post(create_user))
            .layer(Extension(state))
    }

async fn get_current(Extension(state): Extension<Arc<AppState>>) -> (StatusCode, Json<User>)  {
    let user = state.service_container.user.create("aaa").await;

    // this will be converted into a JSON response
    // with a status code of `201 Created`
    (StatusCode::CREATED, Json(user))
}


// async fn create_user(Json(payload): Json<CreateUser>, Extension(state): Extension<Arc<AppState>>) -> (StatusCode, Json<User>) {
//     let user = state.service_container.user.create("bbb").await;
    // this will be converted into a JSON response
    // with a status code of `201 Created`
    // (StatusCode::CREATED, Json(user))
// }
