import { Task } from "../models";
import { v4 as uuidv4 } from "uuid";

export const createTask = async (
    type: string,
    status: string,
    patientId: string,
    doctorId: string | null,
    price: number | null,
    notes: string | null
) => {
    return await Task.create({
        id: uuidv4(),
        type,
        status,
        patientId,
        doctorId,
        price,
        notes,
    });
};

export const updateTask = async (
    taskId: string,
    updates: Partial<{ status: string; notes: string; price: number }>
) => {
    const task = await Task.findByPk(taskId);
    if (!task) throw new Error("Task not found");

    await task.update(updates);
    return task;
};
