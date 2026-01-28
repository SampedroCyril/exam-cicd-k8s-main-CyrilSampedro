import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

describe("Simple API", () => {
  const app = createApp();

  it("GET /health should return 200 and status UP", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("UP");
    expect(res.body).toHaveProperty("version");
  });

  it("GET /api/info should return app info", async () => {
    const res = await request(app).get("/api/info");

    expect(res.status).toBe(200);
    expect(res.body.app).toBe("exam-devops");
    expect(res.body).toHaveProperty("timestamp");
  });
});
