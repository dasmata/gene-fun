use std::sync::Arc;
use axum::{Extension, Json, Router, response::Response};
use axum::extract::Path;
use axum::extract::Query;
use axum::http::StatusCode;
use axum::routing::{get, post, delete};
use axum::response::IntoResponse;
use crate::api::AppState;
use crate::api::models::Training::{CreateTrainingParams};
use crate::api::services::TrainingService::Filters;

pub fn get_router(Extension(state): Extension<Arc<AppState>>) -> Router {
    Router::new()
        .route("/", post(create_training))
        .route("/", get(list_trainings))
        .route("/:training_id", get(get_training))
        .route("/:training_id", delete(delete_training))
        .layer(Extension(state))
}

async fn list_trainings(
    filters: Query<Filters>,
    Extension(state): Extension<Arc<AppState>>
) -> Response {
    let filters: Filters = filters.0;
    let trainings = state
        .service_container
        .training
        .get_all_trainings(filters)
        .await;

    Json(trainings).into_response()
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

async fn delete_training(
    Path(training_id): Path<String>,
    Extension(state): Extension<Arc<AppState>>
) -> Response {
    let training_option = state.service_container.training.get_training(&training_id)
        .await;

    match training_option {
        None => {
            StatusCode::NOT_FOUND.into_response()
        }
        Some(training) => {
            let result = state.service_container.training.delete_training(&training_id).await;
            if result {
                StatusCode::ACCEPTED.into_response()
            } else {
                StatusCode::INTERNAL_SERVER_ERROR.into_response()
            }
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
