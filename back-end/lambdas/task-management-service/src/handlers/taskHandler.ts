import { Context } from "openapi-backend";
import {createTask, getTasksByDoctorId, getTasksByPatientId, updateTask} from "../services/taskService";
import {getImagesByTask, saveImageRecord, uploadImageToS3} from "../services/imageService";
import {AWSError} from "aws-sdk";

export const createTaskHandler = async (context: Context): Promise<Record<string, any>> => {
    try {
        const { type, status, patientId, doctorId, price, notes } = context.request.body;

        if (!type || !status || !patientId) {
            return {
                statusCode: 400,
                body: { message: "Type, status, and patientId are required" },
            };
        }

        const task = await createTask(type, status, patientId, doctorId, price, notes);

        return {
            statusCode: 201,
            body: task,
        };
    } catch (error) {
        console.error("Error creating task:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: (error as AWSError).message },
        };
    }
};

export const getImagesByTaskHandler = async (context: Context): Promise<Record<string, any>> => {
    try {
        const taskId = context.request.params?.taskId;

        if (!taskId) {
            return {
                statusCode: 400,
                body: { message: "Task ID is required" },
            };
        }

        const images = await getImagesByTask(taskId);

        return {
            statusCode: 200,
            body: images,
        };
    } catch (error) {
        console.error("Error fetching images:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: (error as AWSError).message },
        };
    }
};

export const postImageHandler = async (context: Context): Promise<Record<string, any>> => {
    try {
        const { base64Data, type, patientId } = context.request.body;
        const taskId = context.request.params?.taskId;
        if (!base64Data || !type || !patientId || !taskId) {
            return {
                statusCode: 400,
                body: { message: "Base64 data, type, task id and patientId are required" },
            };
        }
        const s3Url = await uploadImageToS3(base64Data, type);
        const image = await saveImageRecord(type, s3Url, patientId, taskId);
        return {
            statusCode: 201,
            body: image,
        };
    } catch (error) {
        console.error("Error uploading image:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: (error as AWSError).message },
        };
    }
};


export const updateTaskHandler = async (context: Context): Promise<Record<string, any>> => {
    try {
        const taskId = context.request.params?.taskId;
        const updates = context.request.body;

        if (!taskId) {
            return {
                statusCode: 400,
                body: { message: "Task ID is required" },
            };
        }
        const task = await updateTask(taskId, updates);
        return {
            statusCode: 200,
            body: task,
        };
    } catch (error) {
        console.error("Error updating task:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: (error as AWSError).message },
        };
    }
};

// Get tasks for a specific doctor
export const getDoctorTasks = async (context: Context): Promise<Record<string, any>> => {
    try {
        const doctorId = context.request.params?.doctorId;

        if (!doctorId) {
            return {
                statusCode: 400,
                body: { message: "Doctor ID is required" },
            };
        }

        const tasks = await getTasksByDoctorId(doctorId);

        if (!tasks.length) {
            return {
                statusCode: 404,
                body: { message: "No tasks found for the specified doctor" },
            };
        }

        return {
            statusCode: 200,
            body: tasks,
        };
    } catch (error) {
        console.error("Error fetching tasks for doctor:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: (error as AWSError).message },
        };
    }
};

// Get tasks for a specific patient
export const getPatientTasks = async (context: Context): Promise<Record<string, any>> => {
    try {
        const patientId = context.request.params?.patientId;

        if (!patientId) {
            return {
                statusCode: 400,
                body: { message: "Patient ID is required" },
            };
        }

        const tasks = await getTasksByPatientId(patientId);

        if (!tasks.length) {
            return {
                statusCode: 404,
                body: { message: "No tasks found for the specified patient" },
            };
        }

        return {
            statusCode: 200,
            body: tasks,
        };
    } catch (error) {
        console.error("Error fetching tasks for patient:", error);
        return {
            statusCode: 500,
            body: { message: "Internal server error", error: (error as AWSError).message },
        };
    }
};