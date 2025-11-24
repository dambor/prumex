#!/bin/bash

# Check if username is provided
if [ -z "$1" ]; then
    echo "Error: Docker Hub username is required."
    echo "Usage: ./push_docker.sh <your-dockerhub-username>"
    exit 1
fi

USERNAME=$1
IMAGE_NAME="prumex"
FULL_IMAGE_NAME="$USERNAME/$IMAGE_NAME"

echo "🚀 Preparing to push '$IMAGE_NAME' to Docker Hub as '$FULL_IMAGE_NAME'..."

# 1. Login (interactive)
echo ""
echo "🔐 Please log in to Docker Hub (if not already logged in):"
docker login

# 2. Tag the image
echo ""
echo "🏷️  Tagging image..."
docker tag $IMAGE_NAME:latest $FULL_IMAGE_NAME:latest

# 3. Push the image
echo ""
echo "⬆️  Pushing image to Docker Hub..."
docker push $FULL_IMAGE_NAME:latest

echo ""
echo "✅ Done! Your image is available at: https://hub.docker.com/r/$USERNAME/$IMAGE_NAME"
