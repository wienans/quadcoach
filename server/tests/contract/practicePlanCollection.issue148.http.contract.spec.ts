import mongoose, { mongo } from "mongoose";
import request from "supertest";

import { PracticePlan } from "../../models/practicePlan";
import PracticePlanAccess from "../../models/practicePlanAccess";
import { app } from "../setup";
import { createVerifiedUser, getAccessToken } from "../utils/auth";

const forwardedFor = (suffix: number) => `192.0.2.${suffix}`;

describe("issue 148 PracticePlan collection HTTP contract", () => {
  it("returns literal filtered summaries with derived counts and no full-plan fields", async () => {
    await mongoose.connection.db!.collection("practiceplans").insertMany([
      {
        name: "Literal [plan].* 10",
        description: "Card description",
        tags: ["Attack", "Fast"],
        isPrivate: false,
        sections: [
          { name: "Warm Up", targetDuration: 15, groups: [] },
          { name: "Main", targetDuration: 90, groups: [] },
        ],
        creator: "must-not-leak",
        createdAt: new Date("2020-01-01T00:00:00Z"),
        updatedAt: new Date("2020-01-02T00:00:00Z"),
        shareToken: "must-not-leak",
        __v: 7,
      },
      {
        name: "Literal planxx 2",
        description: "Other",
        tags: ["Attack"],
        isPrivate: false,
        sections: [{ name: "Solo", targetDuration: 5, groups: [] }],
      },
    ]);

    const response = await request(app)
      .get("/api/practice-plans")
      .set("X-Forwarded-For", forwardedFor(121))
      .query({
        search: "[plan].*",
        tags: ["attack", "FAST"],
        tagMode: "all",
        sort: "name",
        direction: "desc",
        page: "1",
        limit: "25",
      })
      .expect(200);

    expect(response.body).toEqual({
      items: [
        {
          _id: expect.any(String),
          name: "Literal [plan].* 10",
          description: "Card description",
          tags: ["Attack", "Fast"],
          isPrivate: false,
          sectionCount: 2,
          durationMinutes: 105,
        },
      ],
      pagination: { page: 1, limit: 25, total: 1, pages: 1 },
    });
    for (const field of [
      "sections",
      "shareToken",
      "shareLink",
      "user",
      "creator",
      "createdAt",
      "updatedAt",
      "__v",
    ]) {
      expect(response.body.items[0]).not.toHaveProperty(field);
    }
  });

  it("matches singular visibility for anonymous, Owner, both Access levels, Admin, and legacy missing privacy", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "plan_collection_owner@example.com",
    });
    const { user: viewer } = await createVerifiedUser({
      email: "plan_collection_viewer@example.com",
    });
    const { user: editor } = await createVerifiedUser({
      email: "plan_collection_editor@example.com",
    });
    const { user: admin } = await createVerifiedUser({
      email: "plan_collection_admin@example.com",
    });
    admin.roles = ["aDmIn"];
    await admin.save();

    const publicPlan = await PracticePlan.create({
      name: "Public",
      isPrivate: false,
      user: owner._id,
    });
    const legacyPublic = await mongoose.connection
      .db!.collection("practiceplans")
      .insertOne({ name: "Legacy public", user: owner._id });
    const owned = await PracticePlan.create({
      name: "Owned private",
      isPrivate: true,
      user: owner._id,
    });
    const viewGranted = await PracticePlan.create({
      name: "View granted",
      isPrivate: true,
      user: owner._id,
    });
    const editGranted = await PracticePlan.create({
      name: "Edit granted",
      isPrivate: true,
      user: owner._id,
    });
    const hidden = await PracticePlan.create({
      name: "Hidden private",
      isPrivate: true,
      user: owner._id,
      shareToken: "share-link-is-not-discovery-authority",
    });
    await PracticePlanAccess.create([
      { user: viewer._id, practicePlan: viewGranted._id, access: "view" },
      { user: editor._id, practicePlan: editGranted._id, access: "edit" },
    ]);

    const browse = async (suffix: number, token?: string) => {
      const operation = request(app)
        .get("/api/practice-plans")
        .set("X-Forwarded-For", forwardedFor(suffix));
      if (token) operation.set("Authorization", `Bearer ${token}`);
      const response = await operation.expect(200);
      return response.body.items.map((item: { _id: string }) => item._id);
    };

    const anonymous = await browse(122);
    expect(anonymous).toEqual(
      expect.arrayContaining([
        publicPlan.id,
        legacyPublic.insertedId.toString(),
      ]),
    );
    expect(anonymous).toHaveLength(2);
    expect(anonymous).not.toContain(hidden.id);
    const ownerPlans = await browse(124, await getAccessToken(owner));
    expect(ownerPlans).toEqual(
      expect.arrayContaining([
        publicPlan.id,
        legacyPublic.insertedId.toString(),
        owned.id,
        viewGranted.id,
        editGranted.id,
        hidden.id,
      ]),
    );
    expect(ownerPlans).toHaveLength(6);
    const viewerPlans = await browse(125, await getAccessToken(viewer));
    expect(viewerPlans).toEqual(
      expect.arrayContaining([
        publicPlan.id,
        legacyPublic.insertedId.toString(),
        viewGranted.id,
      ]),
    );
    expect(viewerPlans).toHaveLength(3);
    expect(viewerPlans).not.toContain(owned.id);
    expect(viewerPlans).not.toContain(editGranted.id);
    expect(viewerPlans).not.toContain(hidden.id);
    const editorPlans = await browse(126, await getAccessToken(editor));
    expect(editorPlans).toEqual(
      expect.arrayContaining([
        publicPlan.id,
        legacyPublic.insertedId.toString(),
        editGranted.id,
      ]),
    );
    expect(editorPlans).toHaveLength(3);
    expect(editorPlans).not.toContain(owned.id);
    expect(editorPlans).not.toContain(viewGranted.id);
    expect(editorPlans).not.toContain(hidden.id);
    const adminPlans = await browse(127, await getAccessToken(admin));
    expect(adminPlans).toEqual(
      expect.arrayContaining([
        publicPlan.id,
        legacyPublic.insertedId.toString(),
        owned.id,
        viewGranted.id,
        editGranted.id,
        hidden.id,
      ]),
    );
    expect(adminPlans).toHaveLength(6);
  });

  it("narrows the authorized set for private-only requests", async () => {
    const { user } = await createVerifiedUser({
      email: "plan_private_filter@example.com",
    });
    await PracticePlan.create([
      { name: "Public", isPrivate: false, user: user._id },
      { name: "Owned", isPrivate: true, user: user._id },
      { name: "Hidden", isPrivate: true, user: new mongoose.Types.ObjectId() },
    ]);

    const anonymous = await request(app)
      .get("/api/practice-plans?privacy=private")
      .set("X-Forwarded-For", forwardedFor(128))
      .expect(200);
    expect(anonymous.body).toEqual({
      items: [],
      pagination: { page: 1, limit: 50, total: 0, pages: 0 },
    });

    const owner = await request(app)
      .get("/api/practice-plans?privacy=private")
      .set("Authorization", `Bearer ${await getAccessToken(user)}`)
      .set("X-Forwarded-For", forwardedFor(129))
      .expect(200);
    expect(owner.body.items.map((item: { name: string }) => item.name)).toEqual(
      ["Owned"],
    );
  });

  it("supports deterministic pagination with exact totals and successful empty pages", async () => {
    const { user } = await createVerifiedUser({
      email: "plan_pagination@example.com",
    });
    await PracticePlan.create([
      { name: "Alpha", isPrivate: false, user: user._id },
      { name: "Beta", isPrivate: false, user: user._id },
    ]);

    const beyond = await request(app)
      .get("/api/practice-plans")
      .set("X-Forwarded-For", forwardedFor(130))
      .query({ page: "3", limit: "1" })
      .expect(200);
    expect(beyond.body).toEqual({
      items: [],
      pagination: { page: 3, limit: 1, total: 2, pages: 2 },
    });
  });

  it("derives tag facets only from visible plans and rejects query modes", async () => {
    const { user } = await createVerifiedUser({
      email: "plan_facet_owner@example.com",
    });
    await PracticePlan.create([
      {
        name: "A",
        isPrivate: false,
        user: user._id,
        tags: ["Attack", "Zone"],
      },
      {
        name: "B",
        isPrivate: false,
        user: user._id,
        tags: ["attack", "zone"],
      },
      { name: "C", isPrivate: false, user: user._id, tags: ["Attack"] },
      {
        name: "Owned",
        isPrivate: true,
        user: user._id,
        tags: ["Owned"],
      },
      {
        name: "Hidden",
        isPrivate: true,
        user: new mongoose.Types.ObjectId(),
        tags: ["Secret"],
      },
    ]);

    await request(app)
      .get("/api/tags/practiceplans")
      .set("X-Forwarded-For", forwardedFor(131))
      .expect(200, { items: ["Attack", "Zone"] });

    await request(app)
      .get("/api/tags/practiceplans")
      .set("Authorization", `Bearer ${await getAccessToken(user)}`)
      .set("X-Forwarded-For", forwardedFor(132))
      .expect(200, { items: ["Attack", "Owned", "Zone"] });

    await request(app)
      .get("/api/tags/practiceplans?tagName%5Bregex%5D=attack")
      .set("X-Forwarded-For", forwardedFor(133))
      .expect(400, {
        message: "Invalid collection query",
        errors: [{ field: "tagName", code: "unknown" }],
      });
  });

  it("resolves facet display-casing ties deterministically", async () => {
    const { user } = await createVerifiedUser({
      email: "plan_facet_tie@example.com",
    });
    await PracticePlan.create([
      { name: "Tie A", isPrivate: false, user: user._id, tags: ["attack"] },
      { name: "Tie B", isPrivate: false, user: user._id, tags: ["ATTACK"] },
      { name: "Tie C", isPrivate: false, user: user._id, tags: ["Zulu"] },
      { name: "Tie D", isPrivate: false, user: user._id, tags: ["alpha"] },
    ]);

    const first = await request(app)
      .get("/api/tags/practiceplans")
      .set("X-Forwarded-For", forwardedFor(137))
      .expect(200);
    const second = await request(app)
      .get("/api/tags/practiceplans")
      .set("X-Forwarded-For", forwardedFor(138))
      .expect(200);

    // Equal-count "attack"/"ATTACK" collapses to one deterministic display form.
    expect(first.body.items.filter((tag: string) => tag.toLowerCase() === "attack")).toHaveLength(1);
    expect(first.body).toEqual(second.body);
    // Distinct equal-count tags sort deterministically.
    expect(first.body.items.indexOf("alpha") < first.body.items.indexOf("Zulu")).toBe(true);
  });

  it("rejects legacy and unsupported syntax with sanitized failures", async () => {
    await request(app)
      .get(
        "/api/practice-plans?name%5Bregex%5D=x&sortBy=created&privacy=secret&limit=101",
      )
      .set("X-Forwarded-For", forwardedFor(134))
      .expect(400, {
        message: "Invalid collection query",
        errors: [
          { field: "name", code: "unknown" },
          { field: "sortBy", code: "unknown" },
          { field: "limit", code: "outOfRange" },
          { field: "privacy", code: "unsupported" },
        ],
      });

    const countSpy = jest
      .spyOn(mongo.Collection.prototype, "countDocuments")
      .mockRejectedValueOnce(new Error("mongodb://user:password@private-host"));
    const response = await request(app)
      .get("/api/practice-plans")
      .set("X-Forwarded-For", forwardedFor(135))
      .expect(500);
    expect(response.body).toEqual({ message: "Collection query unavailable" });
    expect(JSON.stringify(response.body)).not.toContain("private-host");
    countSpy.mockRestore();
  });

  it("sanitizes authenticated Access lookup failures", async () => {
    const { user } = await createVerifiedUser({
      email: "plan_grant_failure@example.com",
    });
    const grantSpy = jest
      .spyOn(mongo.FindCursor.prototype, "toArray")
      .mockRejectedValueOnce(new Error("mongodb://user:password@private-host"));

    const response = await request(app)
      .get("/api/practice-plans")
      .set("Authorization", `Bearer ${await getAccessToken(user)}`)
      .set("X-Forwarded-For", forwardedFor(136))
      .expect(500);

    expect(response.body).toEqual({ message: "Collection query unavailable" });
    expect(JSON.stringify(response.body)).not.toContain("private-host");
    grantSpy.mockRestore();
  });
});
