# .devcontainer/Dockerfile
# Base image with Python 3.12 and common devtools
FROM mcr.microsoft.com/devcontainers/python:0-3.12

# Install Node.js & npm
RUN apt-get update \
 && apt-get install -y curl \
 && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
 && apt-get install -y nodejs \
 && npm install -g serve

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Working directory inside the container
WORKDIR /workspaces/foodie
