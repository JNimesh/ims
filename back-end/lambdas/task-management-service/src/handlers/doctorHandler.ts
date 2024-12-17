import { Context } from "openapi-backend";
import { getDoctorsByConsultationType } from "../services/doctorService";
import {AWSError} from "aws-sdk";

export const listDoctorsByConsultationType = async (context: Context): Promise<Record<string, any>> => {
    try {
        const consultationTypeId = context.request.query?.consultationTypeId;

        if (!consultationTypeId) {
            return {
                statusCode: 400,
                body: { message: "consultationTypeId is required" },
            };
        }

        const doctors = await getDoctorsByConsultationType(consultationTypeId);

        return {
            statusCode: 200,
            body: doctors,
        };
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: (error as AWSError).message },
        };
    }
};
