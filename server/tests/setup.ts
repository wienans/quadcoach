// Jest global setup for Practice Planner tests with in-memory Mongo
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../app';

// Provide globals for tests
declare global {
  // eslint-disable-next-line no-var
  var __MONGO_SERVER__: MongoMemoryServer;
}

beforeAll(async () => {
  process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
  process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
  process.env.EMAIL_USER = 'test@example.com';
  process.env.EMAIL_PASS = 'password';

  global.__MONGO_SERVER__ = await MongoMemoryServer.create();
  const uri = global.__MONGO_SERVER__.getUri();
  await mongoose.connect(uri, {});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await global.__MONGO_SERVER__.stop();
});

afterEach(async () => {
  // Clean all collections between tests to isolate
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

export { app };
