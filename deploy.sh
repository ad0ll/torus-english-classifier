#!/bin/bash

# Set variables
SERVER="root@65.109.98.153"
REMOTE_DIR="/root/torus-english-detector"

# No need to run a build step since Bun can run TypeScript files directly
echo "Deploying to $SERVER:$REMOTE_DIR..."

# Create the directory on the server if it doesn't exist
ssh $SERVER "mkdir -p $REMOTE_DIR"

# Use rsync to transfer files, excluding those in .gitignore
rsync -avz --exclude-from=.gitignore \
  . "$SERVER:$REMOTE_DIR/" \
  --exclude=".git/" \
  --exclude="node_modules/" \
  --exclude="downloads/"

echo "Files transferred successfully!"


# Copy haproxy config and restart, then start docker
echo "Updating HAProxy config and restarting services..."
ssh $SERVER << EOF
  set -e
  
  cd $REMOTE_DIR
  docker compose down
  docker compose build
  docker compose up -d
EOF

echo "Deployment completed successfully!" 