import mongoose, { mongo } from "mongoose";
import request from "supertest";

import { app } from "../setup";

describe("issue 146 Exercise collection HTTP contract", () => {
  it("returns filtered card summaries in the uniform paginated envelope", async () => {
    const related = new mongo.ObjectId();
    await mongoose.connection.db!.collection("exercises").insertMany([
      {
        name: "Literal [setup].* 10",
        tags: ["Passing", "Fast"],
        materials: ["Cone", "Ball"],
        time_min: 15,
        persons: 8,
        beaters: 2,
        chasers: 6,
        related_to: [related],
        description_blocks: [{ description: "must not leak" }],
      },
      {
        name: "Literal setupxx 2",
        tags: ["Passing"],
        materials: ["Cone"],
        time_min: 5,
        persons: 4,
        beaters: 1,
        chasers: 3,
      },
      { name: "Unknown", tags: ["Passing"], materials: ["Cone"] },
    ]);

    const response = await request(app)
      .get("/api/exercises")
      .query({
        search: "[setup].*",
        tags: ["passing", "FAST"],
        tagMode: "all",
        materials: ["cone", "ball"],
        materialMode: "all",
        durationMin: "10",
        personsMax: "8",
        beatersMin: "2",
        chasersMax: "6",
      })
      .expect(200);

    expect(response.body).toEqual({
      items: [
        expect.objectContaining({
          name: "Literal [setup].* 10",
          tags: ["Passing", "Fast"],
          materials: ["Cone", "Ball"],
          durationMinutes: 15,
          persons: 8,
          beaters: 2,
          chasers: 6,
          relatedTo: [related.toString()],
        }),
      ],
      pagination: { page: 1, limit: 50, total: 1, pages: 1 },
    });
    expect(response.body).not.toHaveProperty("exercises");
    expect(response.body.items[0]).not.toHaveProperty("description_blocks");
    expect(response.body.items[0]).not.toHaveProperty("Blocks");
  });

  it("supports any matching and successful no-match and beyond-end pages", async () => {
    await mongoose.connection.db!.collection("exercises").insertMany([
      { name: "Alpha", tags: ["Attack"], materials: ["Cone"], persons: 4 },
      { name: "Beta", tags: ["Defense"], materials: ["Ball"], persons: 6 },
    ]);

    const any = await request(app)
      .get("/api/exercises")
      .query({ tags: ["missing", "defense"], tagMode: "any" })
      .expect(200);
    expect(any.body.items.map((item: { name: string }) => item.name)).toEqual([
      "Beta",
    ]);
    expect(any.body.pagination.total).toBe(1);

    const noMatch = await request(app)
      .get("/api/exercises")
      .query({ search: "absent" })
      .expect(200);
    expect(noMatch.body).toEqual({
      items: [],
      pagination: { page: 1, limit: 50, total: 0, pages: 0 },
    });

    const beyond = await request(app)
      .get("/api/exercises")
      .query({ page: "3", limit: "1" })
      .expect(200);
    expect(beyond.body).toEqual({
      items: [],
      pagination: { page: 3, limit: 1, total: 2, pages: 2 },
    });
  });

  it("returns strict validation envelopes for legacy and unknown syntax", async () => {
    const response = await request(app)
      .get("/api/exercises?name%5Bregex%5D=x&sortBy=time&limit=101")
      .expect(400);

    expect(response.body).toEqual({
      message: "Invalid collection query",
      errors: [
        { field: "name", code: "unknown" },
        { field: "sortBy", code: "unknown" },
        { field: "limit", code: "outOfRange" },
      ],
    });
  });

  it.each(["/api/materials", "/api/tags/exercises"])(
    "returns a deterministic Exercise facet at %s and rejects query modes",
    async (path) => {
      const field = path === "/api/materials" ? "materials" : "tags";
      await mongoose.connection.db!.collection("exercises").insertMany([
        { name: "A", [field]: ["Zone"] },
        { name: "B", [field]: ["zone"] },
        { name: "C", [field]: ["Zone", "Attack"] },
      ]);

      await request(app)
        .get(path)
        .expect(200, { items: ["Attack", "Zone"] });
      await request(app)
        .get(path)
        .query({ search: "zone" })
        .expect(400, {
          message: "Invalid collection query",
          errors: [{ field: "search", code: "unknown" }],
        });
    },
  );

  it("sanitizes database and timeout failures", async () => {
    const countSpy = jest
      .spyOn(mongo.Collection.prototype, "countDocuments")
      .mockRejectedValueOnce(
        new Error("MongoServerError: mongodb://user:password@private-host"),
      );

    const response = await request(app).get("/api/exercises").expect(500);
    expect(response.body).toEqual({ message: "Collection query unavailable" });
    expect(JSON.stringify(response.body)).not.toContain("private-host");
    countSpy.mockRestore();

    const aggregateSpy = jest
      .spyOn(mongo.Collection.prototype, "aggregate")
      .mockImplementationOnce(() => {
        throw new Error("MongoServerError: operation exceeded time limit");
      });
    const facetResponse = await request(app).get("/api/materials").expect(500);
    expect(facetResponse.body).toEqual({
      message: "Collection query unavailable",
    });
    expect(JSON.stringify(facetResponse.body)).not.toContain("time limit");
    aggregateSpy.mockRestore();
  });
});
