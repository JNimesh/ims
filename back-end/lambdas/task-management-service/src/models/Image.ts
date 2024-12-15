import { Model, DataTypes, Sequelize } from 'sequelize';

export class Image extends Model {
    declare id: string;
    declare type: string;
    declare url: string;
    declare patientId: string;
    declare taskId: string | null;
}

export const initImage = (sequelize: Sequelize) => {
    Image.init(
        {
            id: {
                type: DataTypes.STRING(36),
                primaryKey: true,
            },
            type: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            url: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            patientId: {
                type: DataTypes.STRING(36),
                allowNull: false,
                references: { model: 'Patient', key: 'id' },
            },
            taskId: {
                type: DataTypes.STRING(36),
                allowNull: true,
                references: { model: 'Task', key: 'id' },
            },
        },
        {
            sequelize,
            modelName: 'Image',
            tableName: 'Image',
            timestamps: false, // Since we only track uploadedAt
        }
    );
};
