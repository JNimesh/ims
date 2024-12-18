import { Doctor } from "../models/Doctor";
import { DoctorCompetency } from "../models/DoctorCompetency";
import { ConsultationType } from "../models/ConsultationType";

export const getDoctorsByConsultationType = async (consultationTypeId: string) => {
    return await Doctor.findAll({
        include: [
            {
                model: DoctorCompetency,
                as: "competencies", // Alias defined in the association
                where: consultationTypeId ? { consultationTypeId } : {},
                include: [
                    {
                        model: ConsultationType,
                        as: "consultationType", // Alias defined in the association
                        attributes: ["id", "type", "description", "price"],
                    },
                ],
            },
        ],
    });
};
