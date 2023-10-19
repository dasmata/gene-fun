use std::sync::Arc;
use axum::{Extension, Json, Router, response::Response};
use axum::extract::Path;
use axum::extract::Query;
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::response::IntoResponse;
use crate::api::AppState;
use crate::api::models::Population::{CreatePopulationParams, Population};
use crate::api::services::PopulationService::Filters;

pub fn get_router(Extension(state): Extension<Arc<AppState>>) -> Router {
    Router::new()
        .route("/", post(create_population))
        .route("/:population_id", get(get_population))
        .route("/", get(list_population))
        .layer(Extension(state))
}

async fn list_population(
    filters: Query<Filters>,
    Extension(state): Extension<Arc<AppState>>
) -> Response {
    let filters: Filters = filters.0;
    let populations = state
        .service_container
        .population
        .get_all_populations(filters)
        .await;

    Json(populations).into_response()
}

async fn get_population(
    Path(population_id): Path<String>,
    Extension(state): Extension<Arc<AppState>>
) -> Response {
    let pop_option = state.service_container.population.get_population(&population_id)
        .await;

    match pop_option {
        None => {
            StatusCode::NOT_FOUND.into_response()
        }
        Some(pop) => {
            Json(pop).into_response()
        }
    }
}


async fn create_population(
    Extension(state): Extension<Arc<AppState>>,
    Json(payload): Json<CreatePopulationParams>,
) -> Response {
    let training_option = state.service_container.population.create(payload).await;
    match training_option {
        None => {
            return StatusCode::BAD_REQUEST.into_response()
        }
        Some(training) => Json(training).into_response()
    }
}
