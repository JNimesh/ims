import { Model, DataTypes, Sequelize } from 'sequelize';

export class Doctor extends Model {
    declare id: string;
    declare name: string;
    declare email: string;
    declare authId: string;
}

export const initDoctor = (sequelize: Sequelize) => {
    Doctor.init(
        {
            id: {
                type: DataTypes.STRING(36),
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            authId: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Doctor', // Singular name
            tableName: 'Doctor', // Singular table name
            timestamps: true,
        }
    );
};
