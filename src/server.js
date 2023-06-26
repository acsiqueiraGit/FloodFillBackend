'use strict';

import express from 'express';
import cors from 'cors';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import OpenApiValidator from 'express-openapi-validator';
import { FloodFillsService } from './services/floodfills-service.js';
import { FloodFillsController } from './controllers/floodfills-controller.js';

const app = express();
const port = 3000;

app.use(express.json());

const swaggerJsDocOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FloodFill backend project',
      version: '1.0.0',
      description: 'REST API for providing CRUD-access to the floodfill.'
    }
  },
  apis: ['./src/controllers/*.js', './src/express-error.js']
};
const apiSpec = swaggerJsDoc(swaggerJsDocOptions);

app.get('/swagger.json', (_req, res) => res.json(apiSpec));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(null, { swaggerOptions: { url: '/swagger.json' } }));
app.use(cors());

app.use(OpenApiValidator.middleware({
  apiSpec,
  validateRequests: true,
  validateResponses: true
}));

FloodFillsController.registerRoutes(app, new FloodFillsService());

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors
  });
});

app.listen(port);

console.log('FloodFill Backend API server started on port ' + port);
