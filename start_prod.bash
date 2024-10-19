#!/bin/bash
docker rm quadcoach-mongodb quadcoach-backend quadcoach-frontend
docker image rm quadcoach-app
docker compose -f docker-compose.prod up --build