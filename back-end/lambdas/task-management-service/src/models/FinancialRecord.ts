import { Model, DataTypes, Sequelize } from "sequelize";

export class FinancialRecord extends Model {
    declare id: string;
    declare consultationType: string;
    declare patientCount: number;
    declare taskCount: number;
    declare totalRevenue: number;
    declare duration: string;
    declare recordedAt: Date;
}

export const initFinancialRecord = (sequelize: Sequelize) => {
    FinancialRecord.init(
        {
            id: {
                type: DataTypes.STRING(36),
                primaryKey: true,
            },
            consultationType: {
                type: DataTypes.STRING(36),
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
                type: DataTypes.DECIMAL(15, 2),
                defaultValue: 0,
            },
            duration: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            recordedAt: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: "FinancialRecord",
            tableName: "FinancialRecord",
            timestamps: true,
        }
    );
};
