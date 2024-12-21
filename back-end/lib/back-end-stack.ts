import {Duration, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from "aws-cdk-lib/aws-iam";

const ENV_VARS = {
    DB_HOST: "task-management-db.c3omky0co1uh.ap-south-1.rds.amazonaws.com",
    DB_PORT: "3306",
    DB_NAME: "task_management",
    DB_USER: "admin",
    DB_PASSWORD: "admin123!",
    REGION: 'ap-south-1',
    USER_POOL_ID: "ap-south-1_uhIbqxelM",
    CLIENT_ID: "3sbvcl7ifo0h8cve4takkme495",
    CLIENT_SECRET: "6u0iu5no2b80hrs6dr4n8qt113bfoj42rc9se6uqo50fcaaue4v",
    S3_BUCKET_NAME: "ims-data-s3",
}

export class BackendStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const financeLambda = new lambda.Function(this, 'finance-lambda', {
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 1024,
            timeout: Duration.seconds(30),
            handler: 'dist/index.financeHandler',
            code: lambda.Code.fromAsset('lambdas/finance-data-aggregator/build.zip'),
            environment: {
                ...ENV_VARS
            },
        });

        const notificationLambda = new lambda.Function(this, "NotificationServiceLambda", {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: "dist/index.handler",
            code: lambda.Code.fromAsset('lambdas/notification-service/build.zip'),
            memorySize: 256,
            timeout: Duration.seconds(60),
            environment: {
                REGION: ENV_VARS.REGION,
            },
        });

        // Grant SES permissions to the Lambda
        notificationLambda.addToRolePolicy(
            new iam.PolicyStatement({
                actions: ["ses:SendTemplatedEmail", "ses:SendEmail"],
                resources: ["*"], // Optionally restrict to specific identities
            })
        );

        const services = ['task-management-service'];

        services.forEach((service) => {
            const lambdaFunction = new lambda.Function(this, `${service}-lambda`, {
                runtime: lambda.Runtime.NODEJS_20_X,
                memorySize: 2048,
                timeout: Duration.seconds(30),
                handler: "dist/index.lambdaHandler",
                code: lambda.Code.fromAsset(`lambdas/${service}/build.zip`),
                environment: {
                    ...ENV_VARS,
                    FINANCE_LAMBDA_ARN: financeLambda.functionArn,
                    NOTIFICATION_LAMBDA_ARN: notificationLambda.functionArn,
                }
            });

            lambdaFunction.addToRolePolicy(
                new iam.PolicyStatement({
                    actions: [
                        "cognito-idp:AdminInitiateAuth",
                        "cognito-idp:ListUsers",
                        "cognito-idp:AdminRespondToAuthChallenge",
                        "cognito-idp:AdminCreateUser",
                        "cognito-idp:AdminAddUserToGroup",
                        "cognito-idp:AdminDeleteUser",
                    ],
                    resources: [`arn:aws:cognito-idp:${this.region}:${this.account}:userpool/ap-south-1_uhIbqxelM`],
                })
            );

            lambdaFunction.addToRolePolicy(
                new iam.PolicyStatement({
                    actions: [
                        "s3:PutObject",
                        "s3:GetObject",
                        "s3:DeleteObject",
                        "s3:ListBucket",
                    ],
                    resources: [`arn:aws:s3:::ims-data-s3/*`],
                })
            );

            lambdaFunction.addToRolePolicy(
                new iam.PolicyStatement({
                    actions: [
                        "lambda:InvokeFunction",
                    ],
                    resources: [financeLambda.functionArn, notificationLambda.functionArn],
                })
            )

            new apigateway.LambdaRestApi(this, `${service}-api`, {
                handler: lambdaFunction,
                defaultCorsPreflightOptions: {
                    allowOrigins: apigateway.Cors.ALL_ORIGINS, // Allow all origins
                    allowMethods: apigateway.Cors.ALL_METHODS, // Allow all HTTP methods
                    allowHeaders: ['*']
                },
            });
        });
    }
}
