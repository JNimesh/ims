import { Model, DataTypes, Sequelize } from "sequelize";

export class DoctorCompetency extends Model {
    declare id: string;
    declare doctorId: string;
    declare consultationTypeId: string;
}

export const initDoctorCompetency = (sequelize: Sequelize) => {
    DoctorCompetency.init(
        {
            id: {
                type: DataTypes.STRING(36),
                primaryKey: true,
            },
            doctorId: {
                type: DataTypes.STRING(36),
                allowNull: false,
                references: {
                    model: "Doctor",
                    key: "id",
                },
            },
            consultationTypeId: {
                type: DataTypes.STRING(36),
                allowNull: false,
                references: {
                    model: "ConsultationType",
                    key: "id",
                },
            },
        },
        {
            sequelize,
            tableName: "DoctorCompetency",
            timestamps: true,
        }
    );
};
