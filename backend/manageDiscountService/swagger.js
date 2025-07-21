const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CheapTrip Discount Service API',
      version: '1.0.0',
      description: 'API documentation for CheapTrip Discount Service',
    },
    servers: [
      {
        url: 'http://localhost:5004', // Đổi port nếu service bạn chạy port khác
      },
    ],
  },
  apis: ['./routes/*.js', './swaggerComments.js'], // Đường dẫn tới file comment
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;