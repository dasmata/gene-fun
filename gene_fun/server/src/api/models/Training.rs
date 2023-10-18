use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct CreateTrainingParams {
    pub name: String
}

// the input to our `create_user` handler
#[derive(Deserialize, Serialize)]
pub struct Training {
    pub id: String,
    pub name: String,
    pub start_date: i64,
    pub runs: i32,
    pub user_id: String
}
