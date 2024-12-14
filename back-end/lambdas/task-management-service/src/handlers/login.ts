import AWS, {AWSError} from "aws-sdk";
import crypto from "crypto";
import {Context} from "openapi-backend";

const cognito = new AWS.CognitoIdentityServiceProvider();

const computeSecretHash = (username: string, clientId: string, clientSecret: string) => {
    const message = `${username}${clientId}`;
    const hmac = crypto.createHmac("sha256", clientSecret);
    hmac.update(message);
    return hmac.digest("base64");
};

const USER_POOL_ID = process.env.USER_POOL_ID || "";
const CLIENT_ID = process.env.CLIENT_ID || "";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "";

export const loginHandler = async (
    context: Context
): Promise<any> => {
    try {
        const {email, password} = context.request.body;

        if (!email || !password) {
            return {
                statusCode: 400,
                body: {message: "Email and password are required"}, // Object body
            };
        }

        const params = {
            AuthFlow: "ADMIN_NO_SRP_AUTH",
            UserPoolId: USER_POOL_ID,
            ClientId: CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
                SECRET_HASH: computeSecretHash(email, CLIENT_ID, CLIENT_SECRET),
            },
        };

        let authResult = await cognito.adminInitiateAuth(params).promise();
        // Handle NEW_PASSWORD_REQUIRED challenge
        if (authResult.ChallengeName === "NEW_PASSWORD_REQUIRED") {
            const respondToAuthChallengeParams: AWS.CognitoIdentityServiceProvider.AdminRespondToAuthChallengeRequest =
                {
                    ChallengeName: "NEW_PASSWORD_REQUIRED",
                    ClientId: CLIENT_ID,
                    UserPoolId: USER_POOL_ID,
                    Session: authResult.Session,
                    ChallengeResponses: {
                        USERNAME: email,
                        NEW_PASSWORD: password,
                        ...(CLIENT_SECRET && {
                            SECRET_HASH: computeSecretHash(email, CLIENT_ID, CLIENT_SECRET),
                        }),
                    },
                };
            authResult = await cognito
                .adminRespondToAuthChallenge(respondToAuthChallengeParams)
                .promise();
        }
        return {
            statusCode: 200,
            body: {
                accessToken: authResult.AuthenticationResult?.AccessToken,
                idToken: authResult.AuthenticationResult?.IdToken,
                refreshToken: authResult.AuthenticationResult?.RefreshToken,
                expiresIn: authResult.AuthenticationResult?.ExpiresIn,
                tokenType: authResult.AuthenticationResult?.TokenType,
            }
        };
    } catch (error) {
        console.error("Error during login:", error);
        const code = (error as AWSError).code;
        const errorMessage = (error as AWSError).message;
        if (code === "NotAuthorizedException") {
            return {
                statusCode: 401,
                body: {message: "Invalid email or password"}, // Object body
            };
        }

        if (code === "UserNotFoundException") {
            return {
                statusCode: 404,
                body: {message: "User not found"}, // Object body
            };
        }

        return {
            statusCode: 500,
            body: {message: "Internal server error", error: errorMessage}, // Object body
        };
    }
};

