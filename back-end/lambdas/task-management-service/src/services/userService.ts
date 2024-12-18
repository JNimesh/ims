import { Doctor, Patient } from "../models";

export const createUserInDb = async (
    id: string,
    name: string,
    email: string,
    phone: string | null,
    authId: string,
    role: "DOCTOR" | "PATIENT"
) => {
    const Model = role === "DOCTOR" ? Doctor : Patient;
    return await Model.create({ id, name, email, phone, authId });
};

export const updateUserInDb = async (
    userId: string,
    name: string,
    phone: string | null,
    role: "DOCTOR" | "PATIENT"
) => {
    const Model = role === "DOCTOR" ? Doctor : Patient;
    const user = await Model.findByPk(userId);

    if (!user) {
        throw new Error("User not found");
    }

    await user.update(phone ? { name, phone } : {name});
    return user;
};

export const deleteUserFromDb = async (userId: string, role: "DOCTOR" | "PATIENT") => {
    const Model = role === "DOCTOR" ? Doctor : Patient;
    const user = await Model.findByPk(userId);

    if (!user) {
        throw new Error("User not found");
    }

    await user.destroy();
    return user;
};

export const listPatients = async () => {
    const patientsFromDB=  await Patient.findAll({
        where: {}
    });
    return patientsFromDB;
}

