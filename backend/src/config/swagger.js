/**
 * Syntropy Backend . Swagger/OpenAPI setup
 * Docs UI available at GET /api/docs
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Syntropy Backend API',
      version: '1.0.0',
      description: 'Turns handwritten notes into interactive concept maps and quizzes.',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Reads JSDoc @openapi comments from route files
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
