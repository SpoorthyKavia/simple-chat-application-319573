const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Simple Chat API',
      version: '1.0.0',
      description:
        'REST + WebSocket backend for a simple chat application. Use /docs for REST docs. WebSocket endpoint is documented via /ws-help.',
    },
    tags: [
      { name: 'Health', description: 'Service health and diagnostics' },
      { name: 'Auth', description: 'Signup, login, and current user' },
      { name: 'Messages', description: 'Chat message history and REST message send' },
      { name: 'WebSocket', description: 'Real-time chat via WS (see /ws-help)' },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
