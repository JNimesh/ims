import { Context } from "openapi-backend";
import { getFinancialRecords } from "../services/financeService";
import {AWSError} from "aws-sdk";

export const fetchFinancialRecords = async (context: Context) => {
    try {
        const { duration, consultationType } = context.request.query;

        if (!duration) {
            return {
                statusCode: 400,
                body: { message: "Duration is required" },
            };
        }

        const records = await getFinancialRecords(duration, consultationType);

        return {
            statusCode: 200,
            body: records,
        };
    } catch (error) {
        console.error("Error fetching financial records:", error);
        return {
            statusCode: 400,
            body: { message: (error as AWSError).message },
        };
    }
};
