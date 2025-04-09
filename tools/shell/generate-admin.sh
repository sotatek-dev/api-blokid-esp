#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

if [ -d "./src" ]; then
  node -r ts-node/register tools/generate-admin.ts gen-admin "$@"
else
  node dist/tools/generate-admin.js gen-admin "$@"
fi