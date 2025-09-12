#!/bin/bash
# set -euo pipefail
set -a
source env.env
source secret.env
source mongo.env
set +a
docker compose -f docker-compose.dev down 
docker compose -f docker-compose.prod down
docker rm quadcoach-mongodb quadcoach-backend quadcoach-frontend
docker image rm quadcoach-app
docker compose -f docker-compose.prod up --build -d
