import { Context } from "openapi-backend";
import {
    createConsultationType, doesConsultationTypeExist,
    getConsultationTypes, updateConsultationType,
} from "../services/consulatationTypeService";
import {AWSError} from "aws-sdk";

// Create ConsultationType Handler
export const createConsultationTypeHandler = async (
    context: Context
): Promise<Record<string, any>> => {
    try {
        const { type, description, price } = context.request.body;

        if (!type || price == null) {
            return {
                statusCode: 400,
                body: { message: "Type and price are required" },
            };
        }

        const exists = await doesConsultationTypeExist(type);
        if (exists) {
            return {
                statusCode: 400,
                body: { message: `Consultation type "${type}" already exists.` },
            };
        }

        const consultationType = await createConsultationType(
            type,
            description,
            price
        );

        return {
            statusCode: 201,
            body: consultationType,
        };
    } catch (error) {
        console.error("Error creating consultation type:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: (error as AWSError).message },
        };
    }
};

// Retrieve All ConsultationTypes Handler
export const getConsultationTypesHandler = async (): Promise<
    Record<string, any>
> => {
    try {
        const consultationTypes = await getConsultationTypes();

        return {
            statusCode: 200,
            body: consultationTypes,
        };
    } catch (error) {
        console.error("Error retrieving consultation types:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: (error as AWSError).message },
        };
    }
};

export const updateConsultationTypeHandler = async (
    context: Context
): Promise<Record<string, any>> => {
    try {
        const id = context.request.params?.id;
        const {description, price } = context.request.body;

        if (!id || price == null) {
            return {
                statusCode: 400,
                body: { message: "ID and price are required" },
            };
        }

        const consultationType = await updateConsultationType(
            id,
            description,
            price
        );

        return {
            statusCode: 200,
            body: consultationType,
        };
    } catch (error) {
        console.error("Error updating consultation type:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: (error as AWSError).message },
        };
    }
};
