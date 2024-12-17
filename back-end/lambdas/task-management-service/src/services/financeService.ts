import { FinancialRecord } from "../models/FinancialRecord";

// Validate Duration Format
const isValidDuration = (duration: string): boolean => {
    const monthlyPattern = /^\d{2}-\d{4}$/; // MM-YYYY
    const dailyPattern = /^\d{2}-\d{2}-\d{4}$/; // DD-MM-YYYY
    return monthlyPattern.test(duration) || dailyPattern.test(duration);
};

export const getFinancialRecords = async (duration: string, consultationType?: string) => {
    if (!isValidDuration(duration)) {
        throw new Error("Invalid duration format. Use DD-MM-YYYY or MM-YYYY.");
    }

    const whereClause: any = { duration };
    if (consultationType) {
        whereClause.consultationType = consultationType;
    }

    return await FinancialRecord.findAll({ where: whereClause });
};
