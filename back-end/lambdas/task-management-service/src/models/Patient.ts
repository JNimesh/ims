import { Model, DataTypes, Sequelize } from 'sequelize';

export class Patient extends Model {
    declare id: string;
    declare name: string;
    declare email: string;
    declare phone: string | null;
    declare authId: string;
}

export const initPatient = (sequelize: Sequelize) => {
    Patient.init(
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
            phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            authId: {
                type: DataTypes.STRING(255),
                allowNull: false,
            }
        },
        {
            sequelize,
            modelName: 'Patient', // Singular name
            tableName: 'Patient', // Singular table name
            timestamps: true,
        }
    );
};
