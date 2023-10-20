use bson::{Bson, to_document, doc};
use chrono::{Utc};
use futures_util::{TryStreamExt};
use mongodb::{Collection, options::FindOptions};
use uuid::Uuid;
use models::{Training::Training};
use serde::{Deserialize, Serialize};

#[path = "../models/mod.rs"]
mod models;

#[derive(Deserialize, Serialize)]
pub struct Filters {
    offset: Option<u64>,
    limit: Option<i64>,
    user: Option<String>
}

pub struct TrainingService {
    collection: Collection::<bson::Document>
}

impl TrainingService {
    pub fn new(collection: Collection<bson::Document>) -> TrainingService {
        TrainingService { collection }
    }

    pub async fn get_all_trainings(&self, filters: Filters) -> Vec<Training> {
        let options = FindOptions::builder()
            .limit(filters.limit.unwrap_or(20))
            .skip(filters.offset.unwrap_or(0))
            .sort(doc! {"date": -1})
            .build();

        let mut filter_doc = doc! {};
        match filters.user {
            None => {},
            Some(val) => {
                filter_doc.insert("user_id", val);
            }
        };
        let query_result = self.collection.find(filter_doc, options).await;
        let mut trainings_data = match query_result {
            Ok(data) => data,
            Err(_) => panic!("Could not query the trainings")
        };

        let mut result_vec: Vec<Training> = vec![];

        while let Some(result) = trainings_data.try_next().await.unwrap() {
            result_vec.push(bson::from_bson(Bson::Document(result)).unwrap());
        }

        result_vec
    }

    pub async fn get_training(&self, id: &str) -> Option<Training> {
        let query_result = self.collection.find_one(bson::doc! {"id": id.to_owned()}, None).await;
        let training_data = match query_result {
            Ok(data) => data,
            Err(_) => panic!("Could not query the trainings collection")
        };

        match training_data {
            None => None,
            Some(data) => {
                Some(bson::from_bson(Bson::Document(data)).unwrap())
            }
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
            Err(_) => panic!("Could not create document from training")
        };

        let insert_result = self.collection.insert_one(document, None).await;
        match insert_result {
            Ok(_) => {}
            Err(_) => panic!("Could not insert training")
        }
        Some(training)
    }
}