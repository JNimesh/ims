// cognitoService.ts
import AWS, {AWSError} from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const userPoolId = process.env.USER_POOL_ID!;

export const createCognitoUser = async (
    email: string,
    password: string,
    group: "DOCTOR" | "PATIENT"
): Promise<string> => {
    try {
        // Create user in Cognito
        const createUserResponse = await cognitoIdentityServiceProvider
            .adminCreateUser({
                UserPoolId: userPoolId,
                Username: email,
                TemporaryPassword: password,
                UserAttributes: [
                    { Name: "email", Value: email },
                    { Name: "email_verified", Value: "true" },
                ],
            })
            .promise();
        console.error("Cognito user created:", JSON.stringify(createUserResponse));
        const authId = createUserResponse.User?.Attributes?.find(
            (attr) => attr.Name === "sub"
        )?.Value;


        if (!authId) {
            throw new Error("Cognito user creation failed");
        }

        // Add user to the specified group
        await cognitoIdentityServiceProvider
            .adminAddUserToGroup({
                UserPoolId: userPoolId,
                Username: email,
                GroupName: group,
            })
            .promise();

        return authId;
    } catch (error) {
        if ((error as AWSError).code === "UsernameExistsException") {
            throw new Error("User already exists in Cognito");
        }
        console.error("Error creating Cognito user:", error);
        throw error;
    }
};

export const deleteCognitoUser = async (email: string) => {
    try {
        await cognitoIdentityServiceProvider
            .adminDeleteUser({
                UserPoolId: userPoolId,
                Username: email,
            })
            .promise();
    } catch (error) {
        if (error.code === "UserNotFoundException") {
            throw new Error("User not found in Cognito");
        }
        throw error;
    }
};
