# 1. Backend Service Documentation

## 1.1 Overview
This repository contains the backend infrastructure and services for the application. It uses AWS CDK for infrastructure management and includes three main Lambda services:

1. **task-management-service**
2. **notification-service**
3. **finance-data-aggregator**

The architecture follows a **Service-Oriented Architecture (SOA)** and employs **Event-Driven Communication** for inter-service communication. For example, `task-management-service` communicates with `notification-service` and `finance-data-aggregator` using Lambda event invocation.

---

## 1.2 Folder Structure
- **`lambdas/`**
    - Contains the code for all Lambda functions:
        - `task-management-service`
        - `notification-service`
        - `finance-data-aggregator`
- **`lib/`**
    - Contains the CDK infrastructure code.
    - `lib/backend-stack.ts`: Defines the resources for the backend stack.
- **`scripts/`**
    - Utility scripts for bundling Lambda functions.

---

## 1.3 Prerequisites
1. **Node.js**: Ensure that you have Node.js installed (>= v20).
2. **AWS CLI**: Configure the AWS CLI with appropriate credentials.
3. **CDK Toolkit**: Install AWS CDK globally using:
   ```bash
   npm install -g aws-cdk
   ```
4. **AWS Resources**:
    - Cognito User Pool
    - S3 Bucket (for storing images)
    - RDS Instance (for the database)

   These resources are created outside the backend stack and referenced using environment variables.

---

## 1.4 Setup Instructions

### 1.4.1 Install Dependencies
Run the following commands to install dependencies:

- **Backend Root**:
  ```bash
  npm install
  ```

- **Each Lambda Function**:
  Navigate to each Lambda folder inside `lambdas/` and run:
  ```bash
  npm install
  ```

### 1.4.2 Bundle Lambda Functions
To bundle all Lambda functions, run the provided script:
```bash
./scripts/build-lambdas.sh
```
This script packages the Lambda code into `build.zip` files located in their respective directories.

### 1.4.3 Deploy the Backend Stack
Deploy the backend infrastructure using CDK:
```bash
npx cdk deploy
```
This command will provision the following resources:
- AWS API Gateway
- Task Management Service Lambda
- Notification Service Lambda
- Finance Data Aggregator Lambda

The deployment will output the **API Gateway URL**, which can be used to access the application.

---

## 1.5 Environment Variables
The following environment variables are referenced in `lib/backend-stack.ts` and should be configured:

- **Cognito User Pool**
    - `USER_POOL_ID`
    - `CLIENT_ID`
    - `CLIENT_SECRET`

- **Database Configuration**
    - `DB_HOST`
    - `DB_PORT`
    - `DB_NAME`
    - `DB_USER`
    - `DB_PASSWORD`

- **S3 Bucket**
    - `S3_BUCKET_NAME`

- **Lambda ARNs**
    - `FINANCE_LAMBDA_ARN`
    - `NOTIFICATION_LAMBDA_ARN`

---

## 1.6 Accessing the API
Once deployed, the **API Gateway URL** will be outputted. Use the following endpoint to access the Swagger UI:

```
<API_GATEWAY_URL>/docs
```

Example:
```
https://jclujjkzme.execute-api.ap-south-1.amazonaws.com/prod/docs
```

This provides interactive documentation for all available API endpoints.

---

## 1.7 Additional Notes
- Ensure that your AWS credentials have the necessary permissions to deploy resources.
- Check the `lib/backend-stack.ts` file for any additional environment variables or configurations.
- Use the provided Swagger UI for testing the API endpoints.

# 2. Frontend

## 2.1 Overview
The frontend application is a React-based project built with Ant Design components. It is located in the `frontend/dashboard` directory.

## 2.2 Prerequisites
1. **Node.js**: Ensure that you have Node.js installed (>= v14).
2. **AWS CLI**: Configure the AWS CLI with appropriate credentials.

## 2.3 Setup Instructions

#### 2.3.1 Install Dependencies
Navigate to the `frontend/dashboard` directory and run:
```bash
npm install
```

#### 2.3.2 Build the Application
Run the following command to build the application:
```bash
npm run build
```
This will create a `build` folder inside the `dashboard` directory.

#### 2.4.3 Deploy the Application
Run the deployment script located in the `frontend/scripts/deploy.sh` file:
```bash
./scripts/deploy.sh
```
This script will:
- Upload the build files to the configured S3 bucket.
- Invalidate the CloudFront cache to ensure the latest changes are reflected.

### 2.5 Deployment Details
The application is deployed using S3 and CloudFront. The root URL of the deployed application is:
```
https://ims-data.jnimesh.com/
```
Ensure that all necessary environment variables and AWS resources are configured correctly for successful deployment.
