use bson::{to_document};
use mongodb::{Collection};
use crate::api::models::User::User;

#[path = "../models/User.rs"]
mod user;

pub struct UserService {
    collection: Collection::<bson::Document>
}

impl UserService {
    pub fn new(collection: Collection<bson::Document>) -> UserService {
        UserService { collection }
    }

    pub async fn get_user(&self, _username: &str) -> () {

    }

    pub async fn create(&self, username: &str) -> User {
        let user = User {
            id: bson::Uuid::new(),
            username: username.to_owned(),
        };
        let document_result = to_document(&user);
        let document = match document_result {
            Ok(doc) => doc,
            Err(_) => panic!("Could not create document from User")
        };

        let insert_result = self.collection.insert_one(document, None).await;
        match insert_result {
            Ok(_) => {}
            Err(_) => panic!("Could not insert user")
        }
        user
    }
}