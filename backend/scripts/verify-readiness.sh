#!/bin/bash
set -e

echo "=== Qubrax Real-World Readiness Verification ==="

echo "1. Checking Docker dependencies..."
docker info >/dev/null 2>&1 || { echo >&2 "Docker is not running. Aborting."; exit 1; }

echo "2. Validating Project Structure..."
if [ ! -f "docker-compose.yml" ]; then
    echo "docker-compose.yml not found!"
    exit 1
fi
if [ ! -f "package.json" ]; then
    echo "package.json not found!"
    exit 1
fi

echo "3. Testing Local Compilation..."
npm run build

echo "4. Checking Unit Tests..."
npm run test

echo "5. Verifying Deployment Scripts exist..."
if [ ! -f "scripts/deploy.sh" ]; then
    echo "Deployment script not found!"
    exit 1
fi

echo "================================================="
echo "✅ Readiness Gate Passed: Qubrax is ready for Production!"
echo "================================================="
