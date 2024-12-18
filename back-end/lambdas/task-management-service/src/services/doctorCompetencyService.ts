import { DoctorCompetency } from "../models/DoctorCompetency";
import { v4 as uuidv4 } from "uuid";
import {Op} from "sequelize";

interface CompetencyPayload {
    doctorId: string;
    consultationTypeId: string;
}

// Bulk create Doctor Competencies
export const createDoctorCompetencies = async (competencies: CompetencyPayload[]) => {
    // Step 1: Fetch existing competencies for the given doctor IDs
    const doctorIds = [...new Set(competencies.map(({ doctorId }) => doctorId))];

    const existingCompetencies = await DoctorCompetency.findAll({
        where: {
            doctorId: doctorIds,
        },
    });

    // Step 2: Identify the competencies to keep and delete
    const newKeys = competencies.map(
        ({ doctorId, consultationTypeId }) => `${doctorId}-${consultationTypeId}`
    );

    const toDelete = existingCompetencies.filter(
        (comp) => !newKeys.includes(`${comp.doctorId}-${comp.consultationTypeId}`)
    );

    const toDeleteIds = toDelete.map((comp) => comp.id);

    // Step 3: Delete competencies not in the new list
    if (toDeleteIds.length > 0) {
        await DoctorCompetency.destroy({
            where: {
                id: toDeleteIds,
            },
        });
    }

    // Step 4: Identify new competencies to create
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

    // Step 5: Bulk create new competencies
    if (newCompetencies.length > 0) {
        return await DoctorCompetency.bulkCreate(newCompetencies);
    }

    return [];
};
