use mongodb::{Client, Database, options::ClientOptions, error::Error};

pub(crate) async fn create_db_handler() -> Result<Database, Error>{
    let client_options = ClientOptions::parse("mongodb://localhost:27017").await.unwrap();
    let client = Client::with_options(client_options).unwrap();

    Ok(client.database("gene_fun"))
}