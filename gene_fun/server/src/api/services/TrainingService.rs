use bson::{to_document};
use chrono::{DateTime, Utc};
use futures_util::{AsyncReadExt, TryFutureExt};
use mongodb::{Collection};
use uuid::Uuid;
use models::{Training::Training};

#[path = "../models/mod.rs"]
mod models;

pub struct TrainingService {
    collection: Collection::<bson::Document>
}

impl TrainingService {
    pub fn new(collection: Collection<bson::Document>) -> TrainingService {
        TrainingService { collection }
    }

    pub async fn get_training(&self, id: &str) -> Option<Training> {
        let query_result = self.collection.find_one(bson::doc! {"id": id.to_owned()}, None).await;
        let training_data = match query_result {
            Ok(data) => data,
            Err(_) => panic!("Could not query the trainings collection")
        };
        match training_data {
            None => None,
            Some(data) => Some(Training {
                id: data.get("id").unwrap().to_string(),
                name: data.get("name").unwrap().to_string(),
                start_date: data.get("start_date").unwrap().as_i64().unwrap(),
                runs: 0,
                user_id: data.get("id").unwrap().to_string()
            })
        }
    }

    pub async fn create(&self, name: &str) -> Option<Training> {
        let training = Training {
            id: Uuid::new_v4().to_string(),
            name: name.to_owned(),
            runs: 0,
            user_id: "".to_owned(),
            start_date: Utc::now().timestamp()
        };
        let document_result = to_document(&training);
        let document = match document_result {
            Ok(doc) => doc,
            Err(_) => panic!("Could not create document from User")
        };

        let insert_result = self.collection.insert_one(document, None).await;
        match insert_result {
            Ok(_) => {}
            Err(_) => panic!("Could not insert user")
        }
        Some(training)
    }
}