const app = require('./app');
const { connectMongo } = require('./db/mongo');
const { attachWebSocketServer } = require('./ws');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  await connectMongo();

  const server = app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
    console.log(`WebSocket available at ws://${HOST}:${PORT}/ws`);
  });

  attachWebSocketServer(server);

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  return server;
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
