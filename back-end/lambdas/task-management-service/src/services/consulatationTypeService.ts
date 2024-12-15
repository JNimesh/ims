import { ConsultationType } from "../models/ConsultationType";
import { v4 as uuidv4 } from "uuid";

export const doesConsultationTypeExist = async (type: string): Promise<boolean> => {
    const existingType = await ConsultationType.findOne({
        where: { type },
    });
    return !!existingType;
};

// Create ConsultationType
export const createConsultationType = async (
    type: string,
    description: string | null,
    price: number
) => {
    return await ConsultationType.create({
        id: uuidv4(),
        type,
        description,
        price,
    });
};

// Retrieve All ConsultationTypes
export const getConsultationTypes = async () => {
    return await ConsultationType.findAll();
};

export const updateConsultationType = async (
    id: string,
    description: string | null,
    price: number
) => {
    const consultationType = await ConsultationType.findByPk(id);

    if (!consultationType) {
        throw new Error("ConsultationType not found");
    }

    await consultationType.update({
        description,
        price,
    });

    return consultationType;
};
