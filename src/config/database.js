import path, { dirname } from 'path';
import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../database.sqlite');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false 
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite Database Connected');
    
    await sequelize.sync();
    console.log('Database models synchronized');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
