import {Sequelize} from 'sequelize';
import {initDoctor, Doctor} from './Doctor';
import {initPatient, Patient} from './Patient';
import {initConsultationType} from "./ConsultationType";
import {initTask, Task} from "./Task";
import {initImage, Image} from "./Image";
import {initFinancialRecord, FinancialRecord} from "./FinancialRecord";
import {initDoctorCompetency, DoctorCompetency} from "./DoctorCompetency";

// Setup Sequelize to use SQLite
const sequelize =
    new Sequelize({
        dialect: 'mysql',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    })

// Initialize Models
initDoctor(sequelize);
initPatient(sequelize);
initConsultationType(sequelize);
initTask(sequelize);
initImage(sequelize);
initFinancialRecord(sequelize);
initDoctorCompetency(sequelize);

// Define associations
Patient.hasMany(Task, { foreignKey: 'patientId', as: 'tasks' });
Doctor.hasMany(Task, { foreignKey: 'doctorId', as: 'tasks' });
Task.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Task.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

Patient.hasMany(Image, { foreignKey: 'patientId', as: 'images' });
Task.hasMany(Image, { foreignKey: 'taskId', as: 'images' });
Image.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Image.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');
        // Sync models with database (use cautiously in production)
        // await sequelize.sync({alter: true}); // or { force: true } for development only
    } catch (error) {
        console.error('Error initializing database:', error);
    }
})();

export {Doctor, Patient, Image, Task, FinancialRecord, sequelize};
