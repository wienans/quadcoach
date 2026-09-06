import mongoose from "mongoose";

import Exercise from "../../models/exercise";
import ExerciseAccess from "../../models/exerciseAccess";
import TacticBoard from "../../models/tacticBoard";
import {
  getUserExerciseSummaries,
  getUserTacticBoardSummaries,
} from "../../controllers/userSummaries";
import { createVerifiedUser } from "../utils/auth";

describe("issue 149 user summary Mongo contract", () => {
  it("maps permanent legacy Exercise persistence fields onto fixed card summaries", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "mongo_exercise_owner@example.com",
    });
    const relatedTo = new mongoose.Types.ObjectId();
    const legacyOwnedId = new mongoose.Types.ObjectId();
    await Exercise.collection.insertMany([
      {
        _id: legacyOwnedId,
        name: "Legacy drill",
        user: owner._id,
        creator: "Coach",
        tags: ["Passing"],
        materials: ["Cone", "Ball"],
        time_min: 20,
        persons: 10,
        beaters: 4,
        chasers: 6,
        related_to: [relatedTo],
        createdAt: new Date("2020-01-01T00:00:00Z"),
        updatedAt: new Date("2020-01-02T00:00:00Z"),
        coaching_points: "must not leak",
        description_blocks: [{ description: "must not leak" }],
        __v: 0,
      },
      {
        name: "Sparse drill",
        user: owner._id,
      },
    ]);

    const summaries = await getUserExerciseSummaries(owner.id);

    expect(summaries.accessible).toEqual([]);
    expect(summaries.owned).toHaveLength(2);
    const byName = Object.fromEntries(
      summaries.owned.map((summary) => [summary.name, summary]),
    );
    expect(byName["Legacy drill"]).toEqual({
      _id: legacyOwnedId.toString(),
      name: "Legacy drill",
      tags: ["Passing"],
      creator: "Coach",
      createdAt: new Date("2020-01-01T00:00:00Z"),
      updatedAt: new Date("2020-01-02T00:00:00Z"),
      materials: ["Cone", "Ball"],
      durationMinutes: 20,
      persons: 10,
      beaters: 4,
      chasers: 6,
      relatedTo: [relatedTo.toString()],
    });
    expect(byName["Sparse drill"]).toEqual({
      _id: expect.any(String),
      name: "Sparse drill",
      tags: [],
      creator: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      materials: [],
      durationMinutes: null,
      persons: null,
      beaters: null,
      chasers: null,
      relatedTo: [],
    });
    const serialized = JSON.stringify(summaries);
    expect(serialized).not.toContain("time_min");
    expect(serialized).not.toContain("related_to");
    expect(serialized).not.toContain("must not leak");
    expect(serialized).not.toContain("description_blocks");
    expect(summaries.owned[0]).not.toHaveProperty("user");
  });

  it("keeps every relationship as { item, accessLevel } and drops dangling or corrupted grants", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "mongo_exercise_grants@example.com",
    });
    const { user: collaborator } = await createVerifiedUser({
      email: "mongo_exercise_grants_collaborator@example.com",
    });
    const viewGrantedId = new mongoose.Types.ObjectId();
    const editGrantedId = new mongoose.Types.ObjectId();
    const corruptedGrantedId = new mongoose.Types.ObjectId();
    await Exercise.collection.insertMany([
      { _id: viewGrantedId, name: "View granted", user: collaborator._id },
      { _id: editGrantedId, name: "Edit granted", user: collaborator._id },
      { _id: corruptedGrantedId, name: "Corrupted grant", user: collaborator._id },
      { name: "Unrelated", user: collaborator._id },
    ]);
    await ExerciseAccess.collection.insertMany([
      {
        user: owner._id,
        exercise: viewGrantedId,
        access: "view",
        createdAt: new Date(),
      },
      {
        user: owner._id,
        exercise: editGrantedId,
        access: "edit",
        createdAt: new Date(),
      },
      {
        user: owner._id,
        exercise: new mongoose.Types.ObjectId(),
        access: "view",
        createdAt: new Date(),
      },
      {
        user: owner._id,
        exercise: corruptedGrantedId,
        access: "manage",
        createdAt: new Date(),
      },
    ]);

    const summaries = await getUserExerciseSummaries(owner.id);

    expect(summaries.owned).toEqual([]);
    expect(summaries.accessible).toEqual([
      {
        item: expect.objectContaining({ _id: viewGrantedId.toString() }),
        accessLevel: "view",
      },
      {
        item: expect.objectContaining({ _id: editGrantedId.toString() }),
        accessLevel: "edit",
      },
    ]);
    for (const relationship of summaries.accessible) {
      expect(Object.keys(relationship).sort()).toEqual(["accessLevel", "item"]);
      expect(relationship.item).not.toHaveProperty("access");
      expect(relationship.item).not.toHaveProperty("accessLevel");
    }
    expect(
      summaries.accessible.some((relationship) =>
        relationship.item.name.includes("Corrupted"),
      ),
    ).toBe(false);
  });

  it("keeps TacticBoard summaries free of Pages, Share Link state, and persistence metadata", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "mongo_board_owner@example.com",
    });
    const ownedId = new mongoose.Types.ObjectId();
    await TacticBoard.collection.insertMany([
      {
        _id: ownedId,
        name: "Legacy board",
        user: owner._id,
        creator: "Coach",
        tags: ["Zone"],
        isPrivate: true,
        createdAt: new Date("2020-01-01T00:00:00Z"),
        updatedAt: new Date("2020-01-02T00:00:00Z"),
        description: "must not leak",
        coaching_points: "must not leak",
        pages: [{ objects: [{ type: "circle", secret: "must not leak" }] }],
        shareToken: "must-not-leak",
        __v: 0,
      },
      {
        name: "Sparse board",
        user: owner._id,
      },
    ]);

    const summaries = await getUserTacticBoardSummaries(owner.id);

    expect(summaries.accessible).toEqual([]);
    expect(summaries.owned).toHaveLength(2);
    const byName = Object.fromEntries(
      summaries.owned.map((summary) => [summary.name, summary]),
    );
    expect(byName["Legacy board"]).toEqual({
      _id: ownedId.toString(),
      name: "Legacy board",
      tags: ["Zone"],
      isPrivate: true,
      creator: "Coach",
      createdAt: new Date("2020-01-01T00:00:00Z"),
      updatedAt: new Date("2020-01-02T00:00:00Z"),
    });
    expect(byName["Sparse board"]).toEqual({
      _id: expect.any(String),
      name: "Sparse board",
      tags: [],
      isPrivate: false,
      creator: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    });
    const serialized = JSON.stringify(summaries);
    expect(serialized).not.toContain("pages");
    expect(serialized).not.toContain("shareToken");
    expect(serialized).not.toContain("must not leak");
    expect(serialized).not.toContain("must-not-leak");
    expect(serialized).not.toContain("__v");
  });
});
