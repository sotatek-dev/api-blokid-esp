#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Default values
DEFAULT_SERVER_ADDRESS="172.16.200.107"
DEFAULT_USERNAME="sotatek"
DESTINATION="/home/sotatek/Project/api-blokid-esp"

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
  sshpass -p "$password" rsync -avz Makefile "$username"@"$serverAddress":$DESTINATION/Makefile
  sshpass -p "$password" rsync -avz docker-compose.yml "$username"@"$serverAddress":$DESTINATION/docker-compose.yml
  sshpass -p "$password" rsync -avz --delete --exclude-from='.gitignore' ./ "$username"@"$serverAddress":$DESTINATION
  sshpass -p "$password" ssh "$username"@"$serverAddress" "make build-image --directory=$DESTINATION \
  gitUserName='$gitUserName' \
  gitUserEmail='$gitUserEmail' \
  gitBranch='$gitBranch' \
  gitCommitHash='$gitCommitHash' \
  gitCommitMessage='$gitCommitMessage' \
  isCommitted='$isCommitted' \
  deployTime='$deployTime'"
  sshpass -p "$password" ssh "$username"@"$serverAddress" "make deploy --directory=$DESTINATION"
}

function getDockerImageLabel() {
  # Get the git information: username, email, branch, commit hash, and commit message
  gitUserName=$(git config --get user.name)
  gitUserEmail=$(git config --get user.email)
  gitBranch=$(git rev-parse --abbrev-ref HEAD)
  gitCommitHash=$(git rev-parse HEAD | tail -c 9)
  gitCommitMessage=$(git log -1 --pretty=%B)
  deployTime=$(date +"%Y-%m-%d %H:%M:%S")
  # Check if there are uncommitted changes
  if [ -z "$(git status --porcelain)" ]; then
    isCommitted=true
  else
    isCommitted=false
  fi
}


# Check if sshpass is installed
if ! command -v sshpass &>/dev/null; then
  echo "sshpass could not be found. Please install sshpass to proceed."
  exit 1
fi
# Check if ./tmp directory exists, if not, create it
if [ ! -d "./tmp" ]; then
  mkdir tmp
fi

# Read inputs from the user with default values
read -p "Enter server address [${DEFAULT_SERVER_ADDRESS}]: " serverAddress
serverAddress=${serverAddress:-$DEFAULT_SERVER_ADDRESS}
read -p "Enter username [${DEFAULT_USERNAME}]: " username
username=${username:-$DEFAULT_USERNAME}

# Check if the server address is reachable
read_password
getDockerImageLabel

# Build docker and deploy
deploy "$password" "$username" "$serverAddress"
