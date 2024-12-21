import {Context} from "openapi-backend";
import {createTask, getTasksByDoctorId, getTasksByPatientId, updateTask} from "../services/taskService";
import {getImagesByTask, saveImageRecord, uploadImageToS3} from "../services/imageService";
import {AWSError} from "aws-sdk";
import {Lambda} from 'aws-sdk';
import {Doctor, Patient, Task} from "../models"; // Import AWS SDK for Lambda

const lambda = new Lambda();

async function sendNotificationForReportAssignment(doctorId: string, patientId: string, task: Task) {
    if (doctorId && patientId) {
        const doctor = await Doctor.findByPk(doctorId); // Fetch the doctor's email and name from the database
        const patient = await Patient.findByPk(patientId); // Fetch the patient's name from the database
        const notificationPayload = {
            templateName: "NewReportAssigned",
            recipientEmail: doctor?.email,
            templateData: {
                doctorName: doctor?.name,
                reportId: task.id,
                patientName: patient?.name, // Replace with the patient's name fetched from the database
                assignedDate: new Date().toISOString(),
            },
        };

        // Invoke the notification Lambda function asynchronously
        await lambda
            .invoke({
                FunctionName: process.env.NOTIFICATION_LAMBDA_ARN as string, // Replace with your notification Lambda ARN
                InvocationType: "Event",
                Payload: JSON.stringify(notificationPayload),
            })
            .promise();
    }
}

export const createTaskHandler = async (context: Context): Promise<Record<string, any>> => {
    try {
        const {type, status, patientId, doctorId, price, notes} = context.request.body;

        if (!type || !status || !patientId) {
            return {
                statusCode: 400,
                body: {message: "Type, status, and patientId are required"},
            };
        }

        const task = await createTask(type, status, patientId, doctorId, price, notes);

        const financePayload = {
            consultationType: type,
            patientId,
            price,
            timestamp: new Date().toISOString(),
        };
        // Invoke the finance lambda function asynchronously
        await lambda.invoke({
            FunctionName: process.env.FINANCE_LAMBDA_ARN as string, // Replace with your finance Lambda function name
            InvocationType: 'Event', // Asynchronous invocation
            Payload: JSON.stringify(financePayload),
        }).promise();

        // If a doctor is assigned, send a notification to the doctor
        await sendNotificationForReportAssignment(doctorId, patientId, task);

        return {
            statusCode: 201,
            body: task,
        };
    } catch (error) {
        console.error("Error creating task:", error);
        return {
            statusCode: 500,
            body: {message: "Internal server error", error: (error as AWSError).message},
        };
    }
};

export const getImagesByTaskHandler = async (context: Context): Promise<Record<string, any>> => {
    try {
        const taskId = context.request.params?.taskId;

        if (!taskId) {
            return {
                statusCode: 400,
                body: {message: "Task ID is required"},
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
            body: {message: "Internal server error", error: (error as AWSError).message},
        };
    }
};

export const postImageHandler = async (context: Context): Promise<Record<string, any>> => {
    try {
        const {base64Data, type, patientId} = context.request.body;
        const taskId = context.request.params?.taskId;
        if (!base64Data || !type || !patientId || !taskId) {
            return {
                statusCode: 400,
                body: {message: "Base64 data, type, task id and patientId are required"},
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
            body: {message: "Internal server error", error: (error as AWSError).message},
        };
    }
};


async function sendNotificationForReportDiagnosisComplete(task: Task) {
    const patientId = task.patientId;
    const doctorId = task.doctorId;
    if (doctorId && patientId) {
        const doctor = await Doctor.findByPk(doctorId); // Fetch the doctor's email and name from the database
        const patient = await Patient.findByPk(patientId); // Fetch the patient's name from the database
        const notificationPayload = {
            templateName: "ReportDiagnosisComplete",
            recipientEmail: patient?.email,
            templateData: {
                doctorName: doctor?.name,
                reportId: task.id,
                patientName: patient?.name, // Replace with the patient's name fetched from the database
                completedDate: new Date().toISOString(),
            },
        };
        // Invoke the notification Lambda function asynchronously
        await lambda
            .invoke({
                FunctionName: process.env.NOTIFICATION_LAMBDA_ARN as string, // Replace with your notification Lambda ARN
                InvocationType: "Event",
                Payload: JSON.stringify(notificationPayload),
            })
            .promise();
    }
}

export const updateTaskHandler = async (context: Context): Promise<Record<string, any>> => {
    try {
        const taskId = context.request.params?.taskId;
        const updates = context.request.body;

        if (!taskId) {
            return {
                statusCode: 400,
                body: {message: "Task ID is required"},
            };
        }
        const task = await updateTask(taskId, updates);

        if (updates.status?.toUpperCase() === 'CLOSED') {
            await sendNotificationForReportDiagnosisComplete(task);
        }
        return {
            statusCode: 200,
            body: task,
        };
    } catch (error) {
        console.error("Error updating task:", error);
        return {
            statusCode: 500,
            body: {message: "Internal server error", error: (error as AWSError).message},
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
                body: {message: "Doctor ID is required"},
            };
        }

        const tasks = await getTasksByDoctorId(doctorId);

        return {
            statusCode: 200,
            body: tasks,
        };
    } catch (error) {
        console.error("Error fetching tasks for doctor:", error);
        return {
            statusCode: 500,
            body: {message: "Internal server error", error: (error as AWSError).message},
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
                body: {message: "Patient ID is required"},
            };
        }

        const tasks = await getTasksByPatientId(patientId);

        return {
            statusCode: 200,
            body: tasks,
        };
    } catch (error) {
        console.error("Error fetching tasks for patient:", error);
        return {
            statusCode: 500,
            body: {message: "Internal server error", error: (error as AWSError).message},
        };
    }
};
