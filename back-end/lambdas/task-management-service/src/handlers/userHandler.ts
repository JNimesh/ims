import {Context} from "openapi-backend";
import {Patient, Doctor} from "../models";
import {v4 as uuidv4} from "uuid";
import AWS, {AWSError} from "aws-sdk";
import {createCognitoUser, deleteCognitoUser} from "../services/cognitoService";
import {createUserInDb, deleteUserFromDb, updateUserInDb} from "../services/userService";

const getUserModel = (role: string) => {
    if (role === "doctor") return Doctor;
    if (role === "patient") return Patient;
    throw new Error('Invalid role. Must be "doctor" or "patient".');
};

// Create User Handler
export const createUser = async (context: Context): Promise<Record<string, any>> => {
    try {
        const {name, email, phone, role} = context.request.body;

        if (!name || !email || !role) {
            return {
                statusCode: 400,
                body: {message: "Name, email, and role are required"},
            };
        }

        if (!["DOCTOR", "PATIENT", "ADMIN", "FINANCE"].includes(role?.toUpperCase())) {
            return {
                statusCode: 400,
                body: {message: "Role must be either DOCTOR or PATIENT"},
            };
        }

        const randomPassword = uuidv4();

        // Create user in Cognito
        const authId = await createCognitoUser(email, randomPassword, role);

        if (role?.toUpperCase() === "ADMIN" || role?.toUpperCase() === "FINANCE") {
            return {
                statusCode: 201,
                body: {user: {email, role}},
            };
        } else {
            // Create user in database
            const user = await createUserInDb(uuidv4(), name, email, phone, authId, role);

            return {
                statusCode: 201,
                body: user,
            };
        }
    } catch (error) {
        console.error("Error creating user:", error);
        return {
            statusCode: 500,
            body: {message: "Internal server error", error: (error as AWSError).message},
        };
    }
};

// Update User Handler
export const updateUser = async (context: Context): Promise<Record<string, any>> => {
    try {
        const userId = context.request.params?.userId;
        const role = context.request.query?.role;
        const { name, email, phone } = context.request.body;

        if (!userId || !role) {
            return {
                statusCode: 400,
                body: { message: "User ID and role are required" },
            };
        }

        if (role?.toUpperCase() === "ADMIN" || role?.toUpperCase() === "FINANCE") {
            return {
                statusCode: 400,
                body: { message: "Cannot update admin or finance user" },
            };
        }

        const user = await updateUserInDb(userId, name, email, phone, role.toUpperCase() as "DOCTOR" | "PATIENT");

        return {
            statusCode: 200,
            body: user,
        };
    } catch (error) {
        console.error("Error updating user:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: error.message },
        };
    }
};

// Delete User Handler
export const deleteUser = async (context: Context): Promise<Record<string, any>> => {
    try {
        const userId = context.request.params?.userId;
        const role = context.request.query?.role;

        if (!userId || !role) {
            return {
                statusCode: 400,
                body: { message: "User ID and role are required" },
            };
        }

        if (!["DOCTOR", "PATIENT"].includes(role.toUpperCase())) {
            return {
                statusCode: 400,
                body: { message: "Role must be either DOCTOR or PATIENT" },
            };
        }

        // Get the user from the database
        const user = await deleteUserFromDb(userId, role.toUpperCase() as "DOCTOR" | "PATIENT");

        // Delete the user from Cognito
        await deleteCognitoUser(user.email);

        return {
            statusCode: 204,
            body: {},
        };
    } catch (error) {
        console.error("Error deleting user:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: error.message },
        };
    }
};
