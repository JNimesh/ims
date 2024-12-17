import { DoctorCompetency } from "../models/DoctorCompetency";
import { v4 as uuidv4 } from "uuid";
import {Op} from "sequelize";

interface CompetencyPayload {
    doctorId: string;
    consultationTypeId: string;
}

// Bulk create Doctor Competencies
export const createDoctorCompetencies = async (competencies: CompetencyPayload[]) => {
    const existingCompetencies = await DoctorCompetency.findAll({
        where: {
            [Op.or]: competencies.map(({ doctorId, consultationTypeId }) => ({
                doctorId,
                consultationTypeId,
            })),
        },
    });

    // Filter out existing competencies
    const existingKeys = existingCompetencies.map(
        (comp) => `${comp.doctorId}-${comp.consultationTypeId}`
    );

    const newCompetencies = competencies
        .filter(
            ({ doctorId, consultationTypeId }) =>
                !existingKeys.includes(`${doctorId}-${consultationTypeId}`)
        )
        .map(({ doctorId, consultationTypeId }) => ({
            id: uuidv4(),
            doctorId,
            consultationTypeId,
        }));

    if (newCompetencies.length > 0) {
        return await DoctorCompetency.bulkCreate(newCompetencies);
    } else {
        throw new Error("All provided doctor competencies already exist.");
    }
};
