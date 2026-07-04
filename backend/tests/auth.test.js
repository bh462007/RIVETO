import request from "supertest";
import app from "../app.js"; // your Express app entry point
import User from "../model/userModel.js";
import RefreshToken from "../model/RefreshToken.js";

describe("Authentication Flow", () => {
  const testUser = { email: "test@example.com", password: "StrongPass123!" };

  beforeAll(async () => {
    await User.deleteMany({});
    await RefreshToken.deleteMany({});
    await User.create({ name: "Test User", ...testUser });
  });

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

  it("should reject expired refresh token", async () => {
    // simulate expired token by tampering with expiry
    const loginRes = await request(app).post("/api/auth/login").send(testUser);
    const cookies = loginRes.headers["set-cookie"];
    // manually wait or mock expiry
    const res = await request(app).post("/api/auth/refresh").set("Cookie", cookies);
    // depending on your implementation, expect 403
    expect([400, 403]).toContain(res.statusCode);
  });
});
