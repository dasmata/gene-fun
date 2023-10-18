FROM rust:1.67

WORKDIR /usr/src/gene_fun
COPY ./ ./

RUN cargo install --path ./gene_fun/server

CMD ["gene_fun/server"]