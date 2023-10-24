use std::sync::Arc;
use axum::{Extension, Json, Router, response::Response};
use axum::extract::Path;
use axum::extract::Query;
use axum::http::StatusCode;
use axum::routing::{get, post, delete};
use axum::response::IntoResponse;
use serde::{Deserialize, Serialize};
use crate::api::AppState;
use crate::api::models::Training::{CreateTrainingParams, Training};
use crate::api::services::TrainingService::Filters;
use crate::api::services::PopulationService;

#[derive(Serialize, Deserialize)]
struct TrainingData {
    training: Training,
    generations: Option<u32>,
    level: Option<u16>,
    actions: Option<u64>,
    gene_number: Option<u32>,
    populations_size: Option<usize>
}

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

    let mut trainings_data: Vec<TrainingData> = vec! [];

    for training in trainings {
        let training_id = &training.id;
        let populations = state
            .service_container
            .population
            .get_all_populations(PopulationService::Filters {
                offset: Some(0),
                limit: Some(1),
                training: Some(training_id.to_owned()),
            })
            .await;
        trainings_data.push(match populations.len() {
            0 => {
                TrainingData {
                    training,
                    generations: None,
                    level: None,
                    actions: None,
                    gene_number: None,
                    populations_size: None
                }
            },
            _ => {
                TrainingData {
                    training,
                    generations: Some(populations[0].generations),
                    level: Some(populations[0].level),
                    actions: Some(populations[0].actions),
                    gene_number: Some(populations[0].gene_number),
                    populations_size: Some(populations[0].agents.len())
                }
            }
        });
    }

    Json(trainings_data).into_response()
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
            let training_result = state.service_container.training.delete_training(&training_id).await;
            if training_result {
                state.service_container.population.delete_populations(&training_id).await;
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
