import { Model, DataTypes, Sequelize } from 'sequelize';

export class Task extends Model {
    declare id: string;
    declare type: string;
    declare status: string;
    declare patientId: string;
    declare doctorId: string | null;
    declare price: number | null;
    declare notes: string | null;
}

export const initTask = (sequelize: Sequelize) => {
    Task.init(
        {
            id: {
                type: DataTypes.STRING(36),
                primaryKey: true,
            },
            type: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            patientId: {
                type: DataTypes.STRING(36),
                allowNull: false,
                references: { model: 'Patient', key: 'id' },
            },
            doctorId: {
                type: DataTypes.STRING(36),
                allowNull: true,
                references: { model: 'Doctor', key: 'id' },
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Task',
            tableName: 'Task',
            timestamps: true,
        }
    );
};
