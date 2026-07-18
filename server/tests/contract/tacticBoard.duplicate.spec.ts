import request from "supertest";
import TacticBoard from "../../models/tacticBoard";
import { app } from "../setup";
import { authHeader } from "../utils/auth";

describe("POST /api/tacticboards/:id/duplicate", () => {
  it("duplicates a Tactic Board with a copied name for the authenticated user", async () => {
    const { Authorization, user } = await authHeader();

    const sourceTacticBoard = await TacticBoard.create({
      name: "Original Board",
      isPrivate: true,
      tags: ["transition"],
      creator: user.name,
      user: user._id,
      pages: [
        {
          version: "5.3.0",
          objects: [],
        },
      ],
      description: "Board description",
      coaching_points: "Board coaching points",
      shareToken: "source-share-token",
    });

    const res = await request(app)
      .post(`/api/tacticboards/${sourceTacticBoard._id}/duplicate`)
      .set("Authorization", Authorization)
      .send();

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      message: "Tactic Board duplicated successfully",
    });
    expect(res.body).toHaveProperty("_id");

    const duplicatedTacticBoard = await TacticBoard.findById(
      res.body._id,
    ).lean();
    expect(duplicatedTacticBoard).not.toBeNull();
    expect(duplicatedTacticBoard?.name).toBe("Copy of Original Board");
    expect(duplicatedTacticBoard?.creator).toBe(user.name);
    expect(duplicatedTacticBoard?.user?.toString()).toBe(user._id.toString());
    expect(duplicatedTacticBoard?.tags).toEqual(["transition"]);
    expect(duplicatedTacticBoard?.description).toBe("Board description");
    expect(duplicatedTacticBoard?.coaching_points).toBe(
      "Board coaching points",
    );
    expect(duplicatedTacticBoard?.shareToken).toBeUndefined();
    expect(duplicatedTacticBoard?._id.toString()).not.toBe(
      sourceTacticBoard._id.toString(),
    );
    expect(duplicatedTacticBoard?.pages).toHaveLength(1);
  });
});
