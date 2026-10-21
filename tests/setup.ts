import { afterAll, afterEach, beforeAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import fs from "fs";
import os from "os";
import path from "path";

// Must exist before src/utils/token/jwt.ts is imported
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.NODE_ENV = "test";
// Uploaded test images go to a throwaway folder, never the real uploads/
process.env.UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "agri-uploads-"));

let mongo: MongoMemoryServer;

beforeAll(async () => {
  // MongoDB 8 crashes on some Linux kernels (see docker-compose.yml), so pin 7.x
  mongo = await MongoMemoryServer.create({ binary: { version: "7.0.14" } });
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
  fs.rmSync(process.env.UPLOAD_DIR!, { recursive: true, force: true });
});
