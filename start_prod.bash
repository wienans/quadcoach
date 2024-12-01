#!/bin/bash
rm -rf client/dist
npm --prefix ./client run build
npm --prefix ./server run build
docker compose -f docker-compose.dev down
docker compose -f docker-compose.prod stop
docker rm quadcoach-mongodb quadcoach-backend quadcoach-frontend
docker image rm quadcoach-app
docker compose -f docker-compose.prod up --build -d