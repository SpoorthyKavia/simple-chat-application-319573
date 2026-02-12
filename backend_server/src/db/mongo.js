const mongoose = require('mongoose');

/**
 * PUBLIC_INTERFACE
 * Connect to MongoDB using environment variables.
 *
 * Required env vars:
 * - MONGODB_URL: Mongo connection string (e.g., mongodb://user:pass@host:port/?authSource=admin)
 * - MONGODB_DB:  Database name
 *
 * @returns {Promise<typeof mongoose>} Mongoose connection instance.
 */
async function connectMongo() {
  const mongoUrl = process.env.MONGODB_URL;
  const mongoDb = process.env.MONGODB_DB;

  if (!mongoUrl) {
    throw new Error('Missing required env var: MONGODB_URL');
  }
  if (!mongoDb) {
    throw new Error('Missing required env var: MONGODB_DB');
  }

  // Avoid re-connecting in dev/hot-reload scenarios.
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  await mongoose.connect(mongoUrl, {
    dbName: mongoDb,
    // Keep defaults otherwise; mongoose 8 uses modern connection behavior.
  });

  return mongoose;
}

module.exports = {
  connectMongo,
};
