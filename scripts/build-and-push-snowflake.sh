#!/bin/bash

set -e

DOCKER_REGISTRY="kodercloud"
DOCKER_IMAGE="snowflake-l-2-0-weaviate"
VERSION="${1:-latest}"
FULL_IMAGE="${DOCKER_REGISTRY}/${DOCKER_IMAGE}:${VERSION}"

echo "Building Docker image: ${FULL_IMAGE}"
docker build -t "${FULL_IMAGE}" -f snowflake.Dockerfile .

echo "Tagging image with 'latest' tag"
docker tag "${FULL_IMAGE}" "${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest"

echo "Pushing image to DockerHub"
docker push "${FULL_IMAGE}"
docker push "${DOCKER_REGISTRY}/${DOCKER_IMAGE}:latest"

echo "Successfully built and pushed ${FULL_IMAGE}"
echo "Image available at: https://hub.docker.com/r/${DOCKER_REGISTRY}/${DOCKER_IMAGE}"
