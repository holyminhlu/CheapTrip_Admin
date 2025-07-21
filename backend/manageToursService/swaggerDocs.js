const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;