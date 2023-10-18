use bson::{to_document};
use chrono::{Utc};
use futures_util::{AsyncReadExt, TryFutureExt};
use mongodb::{Collection};
use uuid::Uuid;
use crate::api::models::Population::{CreatePopulationParams, Population};

pub struct PopulationService {
    collection: Collection::<bson::Document>
}

impl PopulationService {
    pub fn new(collection: Collection<bson::Document>) -> PopulationService {
        PopulationService { collection }
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
            date: Utc::now().timestamp()
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
}