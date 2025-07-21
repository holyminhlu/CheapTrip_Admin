const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'CheapTrip Booking Service API',
        version: '1.0.0',
        description: 'API documentation for CheapTrip Booking Service',
      },
      servers: [
        {
          url: 'http://localhost:5002',
        },
      ],
    },
    apis: ['./routes/*.js', './swaggerComments.js'], // Thêm file comment vào đây
  };
  
  const swaggerSpec = require('swagger-jsdoc')(options);
  
  module.exports = swaggerSpec;