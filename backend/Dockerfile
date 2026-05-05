FROM rust:latest AS builder

WORKDIR /app

COPY Cargo*.toml ./
COPY src ./src

RUN cargo build --release

FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/CC3088-PRO2 .

EXPOSE 8080

CMD ["./CC3088-PRO2"]
