use openssl::ssl::{Ssl, SslAcceptor, SslFiletype, SslMethod};
use tokio_openssl::SslStream;
use tokio::net::TcpListener;
use hyper::server::{
    accept::Accept,
    conn::{AddrIncoming, Http},
};
use std::{path::PathBuf, pin::Pin, sync::Arc};
use axum::{http::Request, Router, body::Body};
use tower_http::{
    services::{ServeDir},
};
use futures_util::future::poll_fn;
use std::net::{SocketAddr};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use tower::MakeService;

mod api;

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "example_static_file_server=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();
    let router = using_serve_dir().await;
    tokio::join!(
        serve(router, 3000),
    );
}

async fn using_serve_dir() -> Router {
    let client_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../client");
    let static_service = ServeDir::new(client_dir).append_index_html_on_directories(true);

    Router::new()
        .fallback_service(static_service)
        .nest("/api", api::get_router().await)
}

async fn serve(app: Router, port: u16) {
    let mut tls_builder = SslAcceptor::mozilla_modern_v5(SslMethod::tls()).unwrap();

    tls_builder
        .set_certificate_file(
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("./certs")
                .join("cert.pem"),
            SslFiletype::PEM,
        )
        .unwrap();

    tls_builder
        .set_private_key_file(
            PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("./certs")
                .join("key.pem"),
            SslFiletype::PEM,
        )
        .unwrap();

    tls_builder.check_private_key().unwrap();
    let acceptor = tls_builder.build();
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    let listener = TcpListener::bind(addr).await.unwrap();
    let mut listener = AddrIncoming::from_listener(listener).unwrap();
    let protocol = Arc::new(Http::new());
    let mut service = app.into_make_service();


    loop {
        let stream = poll_fn(|cx| Pin::new(&mut listener).poll_accept(cx))
            .await
            .unwrap()
            .unwrap();

        let acceptor = acceptor.clone();

        let protocol = protocol.clone();

        let svc = MakeService::<_, Request<Body>>::make_service(&mut service, &stream);

        tokio::spawn(async move {
            let ssl = Ssl::new(acceptor.context()).unwrap();
            let mut tls_stream = SslStream::new(ssl, stream).unwrap();

            SslStream::accept(Pin::new(&mut tls_stream)).await.unwrap();

            let _ = protocol
                .serve_connection(tls_stream, svc.await.unwrap())
                .await;
        });
    }
}
