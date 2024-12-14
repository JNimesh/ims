import OpenAPIBackend from "openapi-backend";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { handlers } from "./mock-handler";
import { Request } from "openapi-backend";
import { readFileSync } from "fs";
import path from "path";
import yaml from "yaml";
import * as realHandlers from "./handlers";


// Initialize OpenAPI Backend
const api = new OpenAPIBackend({
    definition: "./open-api.yaml",
});

// Register Handlers
api.register({
    postAuthLogin: realHandlers.handlers.loginHandler,
    // postPatientImages: handlers.postPatientImages,
    // getPatientTasks: handlers.getPatientTasks,
    getPatientTaskById: (c) => handlers.getPatientTaskById(c.request.params?.taskId),
    // getDoctorTasks: handlers.getDoctorTasks,
    // postAdminUsers: handlers.postAdminUsers,
    // putAdminUserById: (c) => handlers.putAdminUserById(c.request.params?.userId),
    // deleteAdminUserById: (c) => handlers.deleteAdminUserById(c.request.params?.userId),
    // postAdminConsultationTypes: handlers.postAdminConsultationTypes,
    // putAdminConsultationTypeById: (c) => handlers.putAdminConsultationTypeById(c.request.params?.id),
});

api.init();

export const lambdaHandler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    try {
        const { path: requestPath, httpMethod } = event;

        // Serve Swagger UI Static Files
        if (requestPath === "/docs") {
            const swaggerHtmlPath = path.resolve("./public/swagger/index.html");
            const swaggerHtml = readFileSync(swaggerHtmlPath, "utf8");

            return {
                statusCode: 200,
                headers: { "Content-Type": "text/html" },
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jsonContent),
            };
        }

        // Handle API Requests
        const response = await api.handleRequest({
            method: event.httpMethod,
            path: event.path,
            body: event.body ? JSON.parse(event.body) : undefined,
            query: event.queryStringParameters || {},
            headers: {}
        } as Request);

        return {
            statusCode: response.statusCode || 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response.body),
        };
    } catch (error) {
        console.error("Error:", error); // Log the error for debugging
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Internal server error", error: error }),
        };
    }
};

