import { Context } from "openapi-backend";
import { createDoctorCompetencies } from "../services/doctorCompetencyService";
import {AWSError} from "aws-sdk";

export const createDoctorCompetenciesHandler = async (context: Context) => {
    try {
        const { competencies } = context.request.body;

        if (!Array.isArray(competencies) || competencies.length === 0) {
            return {
                statusCode: 400,
                body: { message: "A valid array of doctor and consultationType pairs is required" },
            };
        }

        const createdCompetencies = await createDoctorCompetencies(competencies);

        return {
            statusCode: 201,
            body: { message: "Doctor competencies created successfully", data: createdCompetencies },
        };
    } catch (error) {
        console.error("Error creating doctor competencies:", error);
        return {
            statusCode: 400,
            body: { message: (error as AWSError).message },
        };
    }
};
