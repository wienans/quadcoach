import request from "supertest";
import { createTacticBoardVisibilityFixture } from "../fixtures/tacticBoardVisibility";
import { app } from "../setup";

describe("GET /api/tacticboards/:id visibility", () => {
  it("preserves anonymous, Owner, Access, Private, legacy, and Admin behavior", async () => {
    const fixture = await createTacticBoardVisibilityFixture();

    for (const scenario of fixture.scenarios) {
      let httpRequest = request(app)
        .get(`/api/tacticboards/${scenario.tacticBoardId}`)
        .set("X-Forwarded-For", scenario.ipAddress);
      if (scenario.authorization) {
        httpRequest = httpRequest.set("Authorization", scenario.authorization);
      }

      const response = await httpRequest;

      expect({
        scenario: scenario.name,
        status: response.status,
        tacticBoardName: response.body.name,
      }).toEqual({
        scenario: scenario.name,
        status: scenario.expectedStatus,
        tacticBoardName:
          scenario.expectedStatus === 200
            ? scenario.tacticBoardName
            : undefined,
      });
    }
  });
});
