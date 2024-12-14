import {Duration, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from "aws-cdk-lib/aws-iam";

export class BackendStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const services = ['task-management-service'];
        // const services = ['task-management-service', 'image-service', 'notification-service', 'task-service'];

        services.forEach((service) => {
            const lambdaFunction = new lambda.Function(this, `${service}-lambda`, {
                runtime: lambda.Runtime.NODEJS_20_X,
                memorySize: 512,
                timeout: Duration.seconds(10),
                handler: "dist/index.lambdaHandler",
                code: lambda.Code.fromAsset(`lambdas/${service}/build.zip`),
                environment: {
                    USER_POOL_ID: "ap-south-1_uhIbqxelM",
                    CLIENT_ID: "3sbvcl7ifo0h8cve4takkme495",
                    CLIENT_SECRET: "6u0iu5no2b80hrs6dr4n8qt113bfoj42rc9se6uqo50fcaaue4v",
                    DB_HOST: "task-management-db.c3omky0co1uh.ap-south-1.rds.amazonaws.com",
                    DB_PORT: "3306",
                    DB_NAME: "task_management",
                    DB_USER: "admin",
                    DB_PASSWORD: "42fAanya!",
                }
            });

            lambdaFunction.addToRolePolicy(
                new iam.PolicyStatement({
                    actions: [
                        "cognito-idp:AdminInitiateAuth",
                        "cognito-idp:ListUsers",
                        "cognito-idp:AdminRespondToAuthChallenge"
                    ],
                    resources: [`arn:aws:cognito-idp:${this.region}:${this.account}:userpool/ap-south-1_uhIbqxelM`],
                })
            );

            new apigateway.LambdaRestApi(this, `${service}-api`, {
                handler: lambdaFunction,
            });
        });
    }
}
