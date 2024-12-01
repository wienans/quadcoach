#!/bin/bash
docker compose -f docker-compose.prod down
docker volume prune