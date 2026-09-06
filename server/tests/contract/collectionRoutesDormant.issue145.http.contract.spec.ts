import request from "supertest";

import { app } from "../setup";

describe("issue 145 leaves PracticePlan collection activation dormant", () => {
  it("preserves the PracticePlan request and response shape", async () => {
    const response = await request(app).get("/api/practice-plans").expect(200);
    expect(response.body).toEqual({
      practiceplans: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 },
    });
    expect(response.body).not.toHaveProperty("items");
  });
});
