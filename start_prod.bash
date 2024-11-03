#!/bin/bash
docker compose -f docker-compose.dev down
docker rm quadcoach-mongodb quadcoach-backend quadcoach-frontend
docker image rm quadcoach-app
docker compose -f docker-compose.prod up --build -d