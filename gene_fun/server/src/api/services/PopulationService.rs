use bson::{to_document, Bson, doc};
use chrono::{Utc};
use futures_util::{TryStreamExt};
use mongodb::{Collection, options::FindOptions};
use uuid::Uuid;
use crate::api::models::Population::{CreatePopulationParams, Population};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct Filters {
    pub(crate) offset: Option<u64>,
    pub(crate) limit: Option<i64>,
    pub(crate) training: Option<String>
}


pub struct PopulationService {
    collection: Collection::<bson::Document>
}

impl PopulationService {
    pub fn new(collection: Collection<bson::Document>) -> PopulationService {
        PopulationService { collection }
    }
    pub async fn get_all_populations(&self, filters: Filters) -> Vec<Population> {
        let options = FindOptions::builder()
            .limit(filters.limit.unwrap_or(20))
            .skip(filters.offset.unwrap_or(0))
            .sort(doc! {"date": -1})
            .build();

        let mut filter_doc = doc! {};
        match filters.training {
            None => {},
            Some(val) => {
                filter_doc.insert("training", val);
            }
        };
        let query_result = self.collection.find(filter_doc, options).await;
        let mut populations_data = match query_result {
            Ok(data) => data,
            Err(_) => panic!("Could not query the populations")
        };

        let mut result_vec: Vec<Population> = vec![];

        while let Some(result) = populations_data.try_next().await.unwrap() {
            result_vec.push(bson::from_bson(Bson::Document(result)).unwrap());
        }

       result_vec
    }

    pub async fn get_population(&self, id: &str) -> Option<Population> {
        let query_result = self.collection.find_one(bson::doc! {"id": id.to_owned()}, None).await;
        let training_data = match query_result {
            Ok(data) => data,
            Err(_) => panic!("Could not query the populations")
        };

        match training_data {
            None => None,
            Some(data) => {
                Some(bson::from_bson(Bson::Document(data)).unwrap())
            }
        }
    }

    pub async fn create(&self, population_data: CreatePopulationParams) -> Option<Population> {
        let pop = Population {
            id: Uuid::new_v4().to_string(),
            training: population_data.training,
            agents: population_data.agents,
            neurons: population_data.neurons,
            actions: population_data.actions,
            level: population_data.level,
            gene_number: population_data.gene_number,
            min_survivability: population_data.min_survivability,
            date: Utc::now().timestamp(),
            generations: population_data.generations
        };
        let pop_result = to_document(&pop);
        let document = match pop_result {
            Ok(doc) => doc,
            Err(_) => panic!("Could not create document from Population")
        };

        let insert_result = self.collection.insert_one(document, None).await;
        match insert_result {
            Ok(_) => {}
            Err(_) => panic!("Could not insert population")
        }
        Some(pop)
    }

    pub async fn delete_populations(&self, training: &str) -> bool {
        let query_result = self.collection.delete_many(bson::doc! {"training": training.to_owned()}, None).await;
        match query_result {
            Ok(_) => true,
            Err(_) => false
        }
    }
}