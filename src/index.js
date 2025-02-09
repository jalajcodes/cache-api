import dotenv from 'dotenv';
import express from 'express';
import { dirname } from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import cacheRouter from './routes/cache.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cache API',
      version: '1.0.0',
      description: 'A simple caching API with size limits',
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/cache', cacheRouter);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
  });
});