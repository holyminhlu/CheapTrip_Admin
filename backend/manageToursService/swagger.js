const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CheapTrip Tours Service API',
      version: '1.0.0',
      description: 'API documentation for CheapTrip Tours Service',
    },
    servers: [
      {
        url: 'http://localhost:5000', // Đổi port nếu service bạn chạy port khác
      },
    ],
  },
  apis: ['./routes/*.js', './swaggerComments.js'], // Đường dẫn tới file comment
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;