import { Sequelize } from 'sequelize';
import { FinancialRecord } from "../models/FinanceRecord";

export const updateFinancialRecord = async (
    sequelize: Sequelize,
    consultationType: string,
    price: number,
    timestamp: string
) => {
    // Extract monthly and daily durations
    const date = new Date(timestamp);
    const monthlyDuration = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`; // e.g., '12-2024'
    const dailyDuration = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`; // e.g., '21-12-2024'

    const t = await sequelize.transaction(); // Transaction for safety
    try {
        // Helper function to handle updates for both monthly and daily records
        const updateOrCreateRecord = async (duration: string) => {
            const record = await FinancialRecord.findOne({
                where: { consultationType, duration },
                transaction: t,
            });

            if (record) {
                // Update existing record
                record.taskCount += 1;
                record.totalRevenue = Number(record.totalRevenue) + Number(price);
                record.patientCount += 1; // Adjust logic based on your needs
                record.updatedAt = new Date();

                await record.save({ transaction: t });
            } else {
                // Create new record
                await FinancialRecord.create(
                    {
                        consultationType,
                        taskCount: 1,
                        totalRevenue: Number(price),
                        patientCount: 1,
                        duration,
                    },
                    { transaction: t }
                );
            }
        };

        // Update or create records for both monthly and daily aggregations
        await updateOrCreateRecord(monthlyDuration);
        await updateOrCreateRecord(dailyDuration);

        await t.commit();
    } catch (error) {
        await t.rollback();
        throw new Error(`Error updating financial record: ${error}`);
    }
};
