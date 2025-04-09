#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
  echo "sshpass could not be found. Please install sshpass to proceed."
  exit 1
fi

# Function to read password
function read_password() {
  read -sp "Enter password: " password
  echo
  if [ -z "$password" ]; then
    echo "Password cannot be empty"
    exit 1
  fi
  sshpass -p "$password" ssh $username@$serverAddress "echo Correct password"
}

function deploy() {
  set +e

  local password=$1
  local username=$2
  local serverAddress=$3

  # remove all Docker images except the most recent 5
  sshpass -p "$password" rsync -avz Makefile $username@$serverAddress:/home/sofc/Makefile
  sshpass -p "$password" rsync -avz docker-compose.deployment.yml $username@$serverAddress:/home/sofc/docker-compose.yml
  sshpass -p "$password" ssh $username@$serverAddress "make pre-deploy"
  sshpass -p "$password" rsync -avz tmp/sofc-image.tar $username@$serverAddress:/home/sofc
  sshpass -p "$password" ssh $username@$serverAddress "make deploy"
}

# Default values
DEFAULT_SERVER_ADDRESS="45.135.148.229"
DEFAULT_USERNAME="sofc"

# Read inputs from the user with default values
read -p "Enter server address [${DEFAULT_SERVER_ADDRESS}]: " serverAddress
serverAddress=${serverAddress:-$DEFAULT_SERVER_ADDRESS}

read -p "Enter username [${DEFAULT_USERNAME}]: " username
username=${username:-$DEFAULT_USERNAME}

read_password

# Check if ./tmp directory exists, if not, create it
if [ ! -d "./tmp" ]; then
  mkdir tmp
fi

# Build docker and deploy
docker compose build
docker save -o tmp/sofc-image.tar sofc-image
deploy "$password" "$username" "$serverAddress"
