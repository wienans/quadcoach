import { mongo } from "mongoose";

import { decideCollectionVisibility } from "../../authorization/collectionVisibility";
import PracticePlanAccess from "../../models/practicePlanAccess";
import TacticBoardAccess from "../../models/tacticBoardAccess";

describe("authorization-owned collection visibility", () => {
  it("applies public, Exercise, and case-insensitive Admin decisions", async () => {
    await expect(
      decideCollectionVisibility("tacticBoard"),
    ).resolves.toMatchObject({ kind: "public" });
    await expect(decideCollectionVisibility("exercise")).resolves.toMatchObject(
      { kind: "all" },
    );
    await expect(
      decideCollectionVisibility("practicePlan", {
        id: new mongo.ObjectId().toString(),
        roles: ["aDmIn"],
      }),
    ).resolves.toMatchObject({ kind: "all" });
  });

  it("loads all view/edit grants without truncation through actor-first queries", async () => {
    const actor = new mongo.ObjectId();
    const boardIds = Array.from({ length: 125 }, () => new mongo.ObjectId());
    await TacticBoardAccess.insertMany(
      boardIds.map((tacticboard, index) => ({
        user: actor,
        tacticboard,
        access: index % 2 ? "view" : "edit",
      })),
    );
    const plan = new mongo.ObjectId();
    await PracticePlanAccess.create({
      user: actor,
      practicePlan: plan,
      access: "view",
    });

    await expect(
      decideCollectionVisibility("tacticBoard", {
        id: actor.toString(),
        roles: ["user"],
      }),
    ).resolves.toMatchObject({
      kind: "publicOwnedOrGranted",
      ownerId: actor.toString(),
      grantedResourceIds: expect.arrayContaining(boardIds.map(String)),
    });
    const planVisibility = await decideCollectionVisibility("practicePlan", {
      id: actor.toString(),
      roles: [],
    });
    expect(planVisibility).toMatchObject({
      grantedResourceIds: [plan.toString()],
    });
  });
});
