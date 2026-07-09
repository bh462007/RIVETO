import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";
import "../env.js"; // load dotenv before app (mirrors what index.js does)
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import User from "../model/userModel.js";
import RefreshToken from "../model/RefreshToken.js";

jest.setTimeout(60000);

let mongoServer;

const RAW_PASSWORD = "StrongPass123!";
const testUser = { email: "test@example.com", password: RAW_PASSWORD };

beforeAll(async () => {
  // Start an in-memory MongoDB — no real credentials needed
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: "testdb" });

  // Clean and seed — hash the password because login uses bcrypt.compare()
  await User.deleteMany({});
  await RefreshToken.deleteMany({});
  const hashedPassword = await bcrypt.hash(RAW_PASSWORD, 10);
  await User.create({ name: "Test User", email: testUser.email, password: hashedPassword });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Authentication Flow", () => {
  it("should login and issue tokens", async () => {
    const res = await request(app).post("/api/auth/login").send(testUser);
    expect(res.statusCode).toBe(200);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should refresh tokens successfully", async () => {
    const loginRes = await request(app).post("/api/auth/login").send(testUser);
    const cookies = loginRes.headers["set-cookie"];
    const res = await request(app).post("/api/auth/refresh").set("Cookie", cookies);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Tokens refreshed successfully");
  });

  it("should logout and invalidate refresh token", async () => {
    const loginRes = await request(app).post("/api/auth/login").send(testUser);
    const cookies = loginRes.headers["set-cookie"];
    const res = await request(app).post("/api/auth/logout").set("Cookie", cookies);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");
  });

  it("should reject invalid refresh token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", ["refreshToken=invalidtoken123"]);
    expect([400, 403]).toContain(res.statusCode);
  });
});
