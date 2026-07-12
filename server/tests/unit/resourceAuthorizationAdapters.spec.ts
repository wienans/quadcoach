import { Types } from "mongoose";
import { decideResourceAuthorization } from "../../authorization/resourceAuthorization";
import ExerciseAccess from "../../models/exerciseAccess";
import PracticePlanAccess from "../../models/practicePlanAccess";
import TacticboardAccess from "../../models/tacticboardAccess";

jest.setTimeout(30_000);

describe("resource authorization Access adapters", () => {
  it.each([
    ["exercise", ExerciseAccess, "exercise"],
    ["tacticBoard", TacticboardAccess, "tacticboard"],
    ["practicePlan", PracticePlanAccess, "practicePlan"],
  ] as const)(
    "loads edit Access for %s",
    async (type, AccessModel, resourceField) => {
      const userId = new Types.ObjectId();
      const resourceId = new Types.ObjectId();
      await AccessModel.create({
        user: userId,
        [resourceField]: resourceId,
        access: "edit",
      });

      await expect(
        decideResourceAuthorization({
          action: "edit",
          actor: { id: userId.toString(), roles: ["user"] },
          resource: {
            type,
            id: resourceId.toString(),
            ownerId: new Types.ObjectId().toString(),
            isPrivate: true,
          },
        }),
      ).resolves.toEqual({
        allowed: true,
        basis: "granted",
        accessLevel: "edit",
      });
    },
  );
});
