import { Model, DataTypes, Sequelize } from 'sequelize';

export class ConsultationType extends Model {
    declare id: string;
    declare type: string;
    declare description: string | null;
    declare price: number;
    declare createdAt?: Date;
    declare updatedAt?: Date;
}

export const initConsultationType = (sequelize: Sequelize) => {
    ConsultationType.init(
        {
            id: {
                type: DataTypes.STRING(36),
                primaryKey: true,
            },
            type: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'ConsultationType',
            tableName: 'ConsultationType',
            timestamps: true,
        }
    );
};
