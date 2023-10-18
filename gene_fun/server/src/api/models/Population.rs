use serde::{Deserialize, Serialize};

// the output to our `create_user` handler
#[derive(Serialize)]
pub struct User {
    pub id: bson::Uuid,
    pub username: String,
}