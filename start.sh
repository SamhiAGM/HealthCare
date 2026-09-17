#!/bin/bash
echo "Starting Application..."
if [ "$APP_TYPE" = "backend" ]; then
  echo "Booting Backend..."
  npm run start --workspace backend
else
  echo "Booting Frontend..."
  npm run start --workspace frontend
fi
