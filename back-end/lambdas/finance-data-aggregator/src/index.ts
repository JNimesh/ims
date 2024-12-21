import { Sequelize } from 'sequelize';
import { updateFinancialRecord } from './services/financeService';
import {initFinancialRecord} from "./models/FinanceRecord";

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: Number(process.env.DB_PORT || 3306),
    logging: false, // Disable logging for performance
});

initFinancialRecord(sequelize);

export const financeHandler = async (event: any): Promise<void> => {
    console.log("Finance Lambda invoked with payload:", event);

    const { consultationType, patientId, price, timestamp } = event;

    if (!consultationType || !patientId || !price || !timestamp) {
        console.error("Invalid payload:", event);
        throw new Error("Payload is missing required fields");
    }

    try {
        await updateFinancialRecord(sequelize, consultationType, price, timestamp);
        console.log("Financial record updated successfully");
    } catch (error) {
        console.error("Error updating financial record:", error);
        throw error;
    }
};
