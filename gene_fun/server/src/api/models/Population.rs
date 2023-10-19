use serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize)]
pub struct Genes {
    fingerprint: String,
    data: Vec<[i32; 5]>
}

#[derive(Serialize, Deserialize)]
pub struct Agent {
    pub genes: Genes,
    pub id: String,
    pub reward: i32
}

// the output to our `create_user` handler
#[derive(Serialize, Deserialize)]
pub struct CreatePopulationParams {
    pub training: String,
    pub agents: Vec<Agent>,
    pub neurons: Vec<Vec<String>>,
    pub actions: u64,
    pub level: u16,
    pub gene_number: u32,
    pub min_survivability: u8
}

#[derive(Serialize, Deserialize)]
pub struct Population {
    pub id: String,
    pub training: String,
    pub agents: Vec<Agent>,
    pub neurons: Vec<Vec<String>>,
    pub actions: u64,
    pub level: u16,
    pub gene_number: u32,
    pub min_survivability: u8,
    pub date: i64
}