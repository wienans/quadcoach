import request from "supertest";

import { app } from "../setup";

describe("issue 145 leaves active collection contracts dormant", () => {
  it.each([
    ["/api/tacticboards", "tacticboards", { total: 0, page: 1, pages: 0 }],
    [
      "/api/practice-plans",
      "practiceplans",
      { page: 1, limit: 10, total: 0, pages: 0 },
    ],
  ])(
    "preserves %s request and response shape",
    async (path, envelope, pagination) => {
      const response = await request(app).get(path).expect(200);
      expect(response.body).toEqual({ [envelope]: [], pagination });
      expect(response.body).not.toHaveProperty("items");
    },
  );
});
