import {Sequelize} from 'sequelize';
import {initDoctor, Doctor} from './Doctor';
import {initPatient, Patient} from './Patient';

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

export {Doctor, Patient};
