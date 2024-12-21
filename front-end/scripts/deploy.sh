#!/bin/bash

# Define variables
BUCKET_NAME="ims.jnimesh.com"
FRONTEND_DIR="./dashboard"
BUILD_DIR="build"

# Ensure AWS CLI is configured
if ! aws configure list > /dev/null 2>&1; then
    echo "AWS CLI is not configured. Run 'aws configure' to set up."
    exit 1
fi

# Build the project
echo "Building the frontend app..."
cd $FRONTEND_DIR || { echo "Directory not found: $FRONTEND_DIR"; exit 1; }
npm install
npm run build

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo "Build failed or build directory not found."
    exit 1
fi

# Remove existing files from S3 bucket
echo "Deleting existing files from the S3 bucket: $BUCKET_NAME"
aws s3 rm s3://$BUCKET_NAME --recursive

# Upload new files to S3 bucket
echo "Uploading new build files to S3 bucket: $BUCKET_NAME"
aws s3 cp $BUILD_DIR s3://$BUCKET_NAME --recursive

# Set public-read permissions
echo "Making files publicly readable..."
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'"$BUCKET_NAME"'/*"
    }
  ]
}'

# Print success message
echo "Deployment to $BUCKET_NAME complete!"
