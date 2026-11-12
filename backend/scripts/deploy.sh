#!/bin/bash
set -e

echo "Starting Deployment..."

# 1. Pull the latest image
docker pull qubrax/api:latest

# 2. Run Database Migrations in a temporary container
# We pass the production environment variables and run the compiled migration script.
echo "Running Migrations..."
docker run --rm --env-file .env.prod qubrax/api:latest npm run migration:run

# 3. Reload the services with zero-downtime recreation where possible
echo "Restarting API Service..."
docker-compose -f docker-compose.prod.yml up -d --no-deps api

echo "Deployment Successful!"
