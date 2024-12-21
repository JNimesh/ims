import OpenAPIBackend from "openapi-backend";
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {Request} from "openapi-backend";
import {readFileSync} from "fs";
import path from "path";
import yaml from "yaml";
import jwt from "jsonwebtoken";
import * as handlers from "./handlers";
import {sequelize} from "./models";
import {Context as OpenAPIContext} from "openapi-backend";

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

const authMiddleware = async (c: OpenAPIContext, rolesAllowed: string[], handler: (c: OpenAPIContext) => Promise<any>) => {
    const authHeader = c.request.headers.authorization;
    if (!authHeader) {
        return {
            statusCode: 401,
            body: {message: "Unauthorized"},
        };
    }

    if (!validateRoles(authHeader, rolesAllowed)) {
        return {
            statusCode: 403,
            body: {message: "Forbidden"},
        };
    }
    return handler(c);
}

// Register Handlers
// Helper to wrap handlers with authentication middleware
const withAuth = (handler: (c:OpenAPIContext) => Promise<any>, roles: string[]) => (c: OpenAPIContext) => authMiddleware(c, roles, handler);

// Registering API routes
api.register({
    // Authentication
    postAuthLogin: handlers.handlers.loginHandler,

    // Financial Records
    fetchFinancialRecords: withAuth(handlers.handlers.financeHandler.fetchFinancialRecords, ["FINANCE"]),

    // Tasks
    postTaskImages: withAuth(handlers.handlers.taskHandler.postImageHandler, ["PATIENT"]),
    getTaskImages: withAuth(handlers.handlers.taskHandler.getImagesByTaskHandler, ["PATIENT", "DOCTOR"]),
    patchTaskById: withAuth(handlers.handlers.taskHandler.updateTaskHandler, ["DOCTOR"]),
    postTasks: withAuth(handlers.handlers.taskHandler.createTaskHandler, ["PATIENT"]),
    getDoctorTasks: withAuth(handlers.handlers.taskHandler.getDoctorTasks, ["DOCTOR"]),
    getPatientTasks: withAuth(handlers.handlers.taskHandler.getPatientTasks, ["PATIENT"]),

    // Users
    postUsers: withAuth(handlers.handlers.userHandler.createUser, ["ADMIN"]),
    getPatients: withAuth(handlers.handlers.userHandler.getPatients, ["ADMIN"]),
    putUserById: withAuth(handlers.handlers.userHandler.updateUser, ["ADMIN"]),
    deleteUserById: withAuth(handlers.handlers.userHandler.deleteUser, ["ADMIN"]),

    // Consultation Types
    postConsultationTypes: withAuth(handlers.handlers.consultationTypeHandler.createConsultationTypeHandler, ["ADMIN"]),
    getConsultationTypes: withAuth(
        handlers.handlers.consultationTypeHandler.getConsultationTypesHandler,
        ["ADMIN", "FINANCE", "PATIENT", "DOCTOR"]
    ),
    putConsultationTypeById: withAuth(handlers.handlers.consultationTypeHandler.updateConsultationTypeHandler, ["ADMIN"]),

    // Doctor Competencies
    createDoctorCompetencies: withAuth(handlers.handlers.doctorCompetencyHandler.createDoctorCompetenciesHandler, ["ADMIN"]),
    listDoctorsByConsultationType: withAuth(
        handlers.handlers.doctorHandler.listDoctorsByConsultationType,
        ["ADMIN", "PATIENT"]
    ),
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

