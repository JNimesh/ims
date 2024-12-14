import { Context } from "openapi-backend";
import { Patient } from "../models/Patient";
import { Doctor } from "../models/Doctor";
import { v4 as uuidv4 } from "uuid";
import {AWSError} from "aws-sdk";

const getUserModel = (role: string) => {
    if (role === "doctor") return Doctor;
    if (role === "patient") return Patient;
    throw new Error('Invalid role. Must be "doctor" or "patient".');
};

// Create User Handler
export const createUser = async (context: Context): Promise<Record<string, any>> => {
    try {
        const { name, email, phone, role } = context.request.body;

        if (!name || !email || !role) {
            return {
                statusCode: 400,
                body: { message: "Name, email, and role are required" },
            };
        }

        const Model = getUserModel(role);
        const authId = uuidv4(); // Replace with Cognito logic

        const user = await Model.create({
            id: uuidv4(),
            name,
            email,
            phone,
            authId,
        });

        return {
            statusCode: 201,
            body: user,
        };
    } catch (error) {
        console.error("Error creating user:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: (error as AWSError).message },
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

        const Model = getUserModel(role);
        const user = await Model.findByPk(userId);

        if (!user) {
            return {
                statusCode: 404,
                body: { message: "User not found" },
            };
        }

        await user.update({ name, email, phone });

        return {
            statusCode: 200,
            body: user,
        };
    } catch (error) {
        console.error("Error updating user:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: (error as AWSError).message },
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

        const Model = getUserModel(role);
        const user = await Model.findByPk(userId);

        if (!user) {
            return {
                statusCode: 404,
                body: { message: "User not found" },
            };
        }

        await user.destroy();

        return {
            statusCode: 204,
            body: {},
        };
    } catch (error) {
        console.error("Error deleting user:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: (error as AWSError).message },
        };
    }
};
