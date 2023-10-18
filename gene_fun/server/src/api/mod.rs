use std::sync::Arc;
use axum::{Router, Extension};
use services::{UserService::UserService, TrainingService::TrainingService};
use mongodb::{Database};
use controllers::{user, training};
#[path = "./controllers/mod.rs"]
mod controllers;
mod services;
mod db;
mod models;

pub struct AppState {
    service_container: ServiceContainer
}

pub async fn get_router() -> Router {

    let shared_state = Arc::new(AppState {
        service_container: ServiceContainer::new(db::create_db_handler().await.unwrap())
    });

    Router::new()
        .nest("/user", user::get_router(Extension(shared_state.clone())))
        .nest("/training", training::get_router(Extension(shared_state.clone())))
}

pub struct ServiceContainer {
    user: UserService,
    training: TrainingService
}

impl ServiceContainer {
    pub fn new(db: Database) -> ServiceContainer {
        ServiceContainer {
            user: UserService::new(db.collection("users")),
            training: TrainingService::new(db.collection("trainings"))
        }
    }
}


