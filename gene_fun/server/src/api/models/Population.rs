use std::any::Any;
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct NeuronVal {
    activation: String,
    constructor: String,
    summation: u16
}


#[derive(Serialize, Deserialize)]
pub struct Genes {
    fingerprint: String,
    data: Vec<[f64; 5]>
}

#[derive(Serialize, Deserialize)]
pub struct Agent {
    pub genes: Genes,
    pub id: String,
    pub reward: Option<i32>
}

// the output to our `create_user` handler
#[derive(Serialize, Deserialize)]
pub struct CreatePopulationParams {
    pub training: String,
    pub agents: Vec<Agent>,
    pub neurons: Vec<HashMap<String, NeuronVal>>,
    pub actions: u64,
    pub level: u16,
    pub gene_number: u32,
    pub min_survivability: u8,
    pub generations: Option<u32>
}

#[derive(Serialize, Deserialize)]
pub struct Population {
    pub id: String,
    pub training: String,
    pub agents: Vec<Agent>,
    pub neurons: Vec<HashMap<String, NeuronVal>>,
    pub actions: u64,
    pub level: u16,
    pub gene_number: u32,
    pub min_survivability: u8,
    pub date: i64,
    pub generations: Option<u32>
}