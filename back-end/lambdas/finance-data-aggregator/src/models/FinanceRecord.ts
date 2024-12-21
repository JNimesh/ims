import { DataTypes, Model, Sequelize } from 'sequelize';

export class FinancialRecord extends Model {
    id!: string;
    consultationType!: string;
    patientCount!: number;
    taskCount!: number;
    totalRevenue!: number;
    duration!: string; // Example: '2024-12' for year-month
    updatedAt!: Date;
}

export const initFinancialRecord = (sequelize: Sequelize) => {
    FinancialRecord.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            consultationType: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            patientCount: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            taskCount: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            totalRevenue: {
                type: DataTypes.FLOAT,
                defaultValue: 0,
            },
            duration: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'FinancialRecord',
            tableName: 'financial_records',
            timestamps: false,
        }
    );
};
