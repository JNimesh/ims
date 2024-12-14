#!/bin/bash

# Iterate over each directory inside the `lambdas` folder
for dir in lambdas/*; do
  if [ -d "$dir" ]; then
    echo "Building $dir..."

    # Navigate to the service directory
    cd "$dir" || exit

    # Install production dependencies
    echo "Installing dependencies for $dir..."
    npm install --production || { echo "Failed to install dependencies for $dir"; exit 1; }

    # Build the service
    echo "Building the service in $dir..."
    npm run build || { echo "Build failed for $dir"; exit 1; }

    # Bundle the service into a zip file
    echo "Creating zip bundle for $dir..."
    zip -r "build.zip" ./dist ./node_modules ./public package.json open-api.yaml package-lock.json || { echo "Failed to create zip bundle for $dir"; exit 1; }

    # Return to the root directory
    cd - || exit
  fi
done

echo "All services bundled successfully."
