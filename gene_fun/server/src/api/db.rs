use mongodb::{Client, Database, options::ClientOptions, error::Error};
use std::fs::File;
use std::io::Read;
use std::path::PathBuf;
use axum::Json;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct DbConfig {
    host: String,
    port: String,
    user: Option<String>,
    pass: Option<String>,
    db: String
}

fn get_db_config() -> DbConfig {
    let mut file = File::open(
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("config")
            .join("database.json")
    ).unwrap();
    let mut data = String::new();
    file.read_to_string(&mut data).unwrap();
    serde_json::from_str(&data).unwrap()
}

pub(crate) async fn create_db_handler() -> Result<Database, Error>{
    let config = get_db_config();
    let mut config_str : String = "mongodb://".to_owned();

    match config.user {
        None => {}
        Some(user) => {
            config_str.push_str(&user);
            config_str.push_str(":");
        }
    }
    match config.pass {
        None => {}
        Some(pass) => {
            config_str.push_str(&pass);
            config_str.push_str("@");
        }
    }
    config_str.push_str(&config.host);
    config_str.push_str(":");
    config_str.push_str(&config.port);
    config_str.push_str("/");
    config_str.push_str(&config.db);

    let client_options = ClientOptions::parse(config_str).await.unwrap();
    let client = Client::with_options(client_options).unwrap();

    Ok(client.database(&config.db))
}