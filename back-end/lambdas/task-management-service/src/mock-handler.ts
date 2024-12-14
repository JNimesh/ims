import { components, paths } from "./types";

// Define mock data
const mockTasks: components["schemas"]["Task"][] = [
    {
        id: "1",
        type: "consultation",
        status: "open",
        patientId: "p1",
        doctorId: "d1",
        createdAt: new Date().toISOString(),
        price: 100.0,
        notes: "Initial consultation",
    },
];

const mockUsers: components["schemas"]["User"][] = [
    {
        id: "p1",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "123-456-7890",
    },
    {
        id: "d1",
        name: "Dr. Jane Smith",
        email: "jane.smith@example.com",
        phone: "987-654-3210",
    },
];

// Mock Handlers for each endpoint
export const handlers = {
    postAuthLogin: async () => ({
        statusCode: 200,
        body: {
            token: "mock-token",
        },
    }),

    postPatientImages: async () => ({
        statusCode: 201,
        body: {
            message: "Image uploaded",
        },
    }),

    getPatientTasks: async () => ({
        statusCode: 200,
        body: mockTasks,
    }),

    getPatientTaskById: async (taskId: string) => {
        const task = mockTasks.find((t) => t.id === taskId);
        if (!task) {
            return { statusCode: 404, body: { message: "Task not found" } };
        }
        return { statusCode: 200, body: task };
    },

    getDoctorTasks: async () => ({
        statusCode: 200,
        body: mockTasks.filter((t) => t.doctorId === "d1"),
    }),

    postAdminUsers: async () => ({
        statusCode: 201,
        body: mockUsers[0],
    }),

    putAdminUserById: async (userId: string) => {
        const user = mockUsers.find((u) => u.id === userId);
        if (!user) {
            return { statusCode: 404, body: { message: "User not found" } };
        }
        user.name = "Updated Name";
        return { statusCode: 200, body: user };
    },

    deleteAdminUserById: async (userId: string) => {
        const index = mockUsers.findIndex((u) => u.id === userId);
        if (index === -1) {
            return { statusCode: 404, body: { message: "User not found" } };
        }
        mockUsers.splice(index, 1);
        return { statusCode: 204, body: null };
    },

    postAdminConsultationTypes: async () => ({
        statusCode: 201,
        body: {
            id: "1",
            type: "Consultation",
            description: "General Consultation",
            price: 50.0,
        },
    }),

    putAdminConsultationTypeById: async (id: string) => ({
        statusCode: 200,
        body: {
            id,
            type: "Updated Consultation",
            description: "Updated Description",
            price: 60.0,
        },
    }),
};
