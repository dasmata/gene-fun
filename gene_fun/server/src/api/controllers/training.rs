use std::sync::Arc;
use axum::{Extension, Json, Router, response::Response};
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::extract::Path;
use axum::response::IntoResponse;
use crate::api::AppState;
use models::Training::{Training, CreateTrainingParams};

#[path = "../models/mod.rs"]
mod models;

pub fn get_router(Extension(state): Extension<Arc<AppState>>) -> Router {
    Router::new()
        .route("/", post(create_training))
        .route("/:training_id", get(get_training))
        .layer(Extension(state))
}

async fn get_training(
    Path(training_id): Path<String>,
    Extension(state): Extension<Arc<AppState>>
) -> Response {
    let training_option = state.service_container.training.get_training(&training_id)
        .await;


    match training_option {
        None => {
            return StatusCode::NOT_FOUND.into_response()
        }
        Some(training) => {
            return Json(training).into_response()
        }
    }
}


async fn create_training(
    Extension(state): Extension<Arc<AppState>>,
    Json(payload): Json<CreateTrainingParams>,
) -> Response {
    let training_option = state.service_container.training.create(&payload.name).await;
    match training_option {
        None => {
            StatusCode::BAD_REQUEST.into_response()
        }
        Some(training) => {
            Json(training).into_response()
        }
    }
}
