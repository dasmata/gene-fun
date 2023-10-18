use std::sync::Arc;
use axum::{Extension, Json, Router, response::Response};
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::response::IntoResponse;
use crate::api::AppState;
use crate::api::models::Population::{CreatePopulationParams, Population};

pub fn get_router(Extension(state): Extension<Arc<AppState>>) -> Router {
    Router::new()
        .route("/", post(create_population))
        .layer(Extension(state))
}


async fn create_population(
    Extension(state): Extension<Arc<AppState>>,
    Json(payload): Json<CreatePopulationParams>,
) -> Response {
    let training_option = state.service_container.population.create(payload).await;
    // match training_option {
    //     None => {
    //         return StatusCode::BAD_REQUEST.into_response()
    //     }
    //     Some(training) => Json(training).into_response()
    // }
    StatusCode::OK.into_response()
}
