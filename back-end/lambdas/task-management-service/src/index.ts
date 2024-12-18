import OpenAPIBackend from "openapi-backend";
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {Request} from "openapi-backend";
import {readFileSync} from "fs";
import path from "path";
import yaml from "yaml";
import jwt from "jsonwebtoken";
import * as handlers from "./handlers";
import {sequelize} from "./models";

// Helper to decode JWT and extract roles
const getRolesFromToken = (authHeader?: string): string[] => {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return [];
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.decode(token);

    if (!decoded || typeof decoded === "string" || !decoded["cognito:groups"]) {
        return [];
    }

    return decoded["cognito:groups"] as string[];
};

const validateRoles = (token: string, requiredRoles: string[]): boolean => {
    const roles = getRolesFromToken(token);
    return roles.some((role) => requiredRoles.includes(role))
};


// Initialize OpenAPI Backend
const api = new OpenAPIBackend({
    definition: "./open-api.yaml",
});

// Register Handlers
api.register({
    postAuthLogin: handlers.handlers.loginHandler,
    fetchFinancialRecords: handlers.handlers.financeHandler.fetchFinancialRecords,
    postTaskImages: handlers.handlers.taskHandler.postImageHandler,
    getTaskImages: handlers.handlers.taskHandler.getImagesByTaskHandler,
    patchTaskById: handlers.handlers.taskHandler.updateTaskHandler,
    postTasks: handlers.handlers.taskHandler.createTaskHandler,
    getDoctorTasks: handlers.handlers.taskHandler.getDoctorTasks,
    getPatientTasks: handlers.handlers.taskHandler.getPatientTasks,
    postUsers: handlers.handlers.userHandler.createUser,
    getPatients: handlers.handlers.userHandler.getPatients,
    putUserById: handlers.handlers.userHandler.updateUser,
    deleteUserById: handlers.handlers.userHandler.deleteUser,
    postConsultationTypes: handlers.handlers.consultationTypeHandler.createConsultationTypeHandler,
    getConsultationTypes: handlers.handlers.consultationTypeHandler.getConsultationTypesHandler,
    putConsultationTypeById: handlers.handlers.consultationTypeHandler.updateConsultationTypeHandler,
    createDoctorCompetencies: handlers.handlers.doctorCompetencyHandler.createDoctorCompetenciesHandler,
    listDoctorsByConsultationType: handlers.handlers.doctorHandler.listDoctorsByConsultationType,
});

api.init();
sequelize.authenticate();

export const lambdaHandler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const {path: requestPath, httpMethod} = event;

        // Serve Swagger UI Static Files
        if (requestPath === "/docs") {
            const swaggerHtmlPath = path.resolve("./public/swagger/index.html");
            const swaggerHtml = readFileSync(swaggerHtmlPath, "utf8");

            return {
                statusCode: 200,
                headers: {"Content-Type": "text/html"},
                body: swaggerHtml,
            };
        }

        // Serve OpenAPI Spec
        if (requestPath === "/schema") {
            // Read and parse the YAML file
            const yamlContent = readFileSync("./open-api.yaml", "utf8");
            console.log(yamlContent);
            const jsonContent = yaml.parse(yamlContent);

            // Return the JSON content
            return {
                statusCode: 200,
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(jsonContent),
            };
        }

        // Handle API Requests
        const response = await api.handleRequest({
            method: event.httpMethod,
            path: event.path,
            body: event.body ? JSON.parse(event.body) : undefined,
            query: event.queryStringParameters || {},
            headers: event.headers
        } as Request);

        return {
            statusCode: response.statusCode || 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PUT, DELETE",
                "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify(response.body),
        };
    } catch (error) {
        console.error("Error:", error); // Log the error for debugging
        return {
            statusCode: 500,
            body: JSON.stringify({message: "Internal server error", error: error}),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS, POST, GET, PUT, DELETE",
                "Access-Control-Allow-Headers": "*",
            }
        };
    }
};

