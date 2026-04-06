import request from "supertest";
import TacticBoard from "../../models/tacticboard";
import { app } from "../setup";
import { authHeader } from "../utils/auth";

describe("POST /api/tacticboards/:id/duplicate", () => {
  it("duplicates a tacticboard with a copied name for the authenticated user", async () => {
    const { Authorization, user } = await authHeader();

    const sourceBoard = await TacticBoard.create({
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
      .post(`/api/tacticboards/${sourceBoard._id}/duplicate`)
      .set("Authorization", Authorization)
      .send();

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      message: "Tacticboard duplicated successfully",
    });
    expect(res.body).toHaveProperty("_id");

    const duplicateBoard = await TacticBoard.findById(res.body._id).lean();
    expect(duplicateBoard).not.toBeNull();
    expect(duplicateBoard?.name).toBe("Copy of Original Board");
    expect(duplicateBoard?.creator).toBe(user.name);
    expect(duplicateBoard?.user?.toString()).toBe(user._id.toString());
    expect(duplicateBoard?.tags).toEqual(["transition"]);
    expect(duplicateBoard?.description).toBe("Board description");
    expect(duplicateBoard?.coaching_points).toBe("Board coaching points");
    expect(duplicateBoard?.shareToken).toBeUndefined();
    expect(duplicateBoard?._id.toString()).not.toBe(sourceBoard._id.toString());
    expect(duplicateBoard?.pages).toHaveLength(1);
  });
});
