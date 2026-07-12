import request from "supertest";
import Exercise from "../../models/exercise";
import ExerciseAccess from "../../models/exerciseAccess";
import TacticBoard from "../../models/tacticboard";
import TacticboardAccess from "../../models/tacticboardAccess";
import { PracticePlan } from "../../models/practicePlan";
import PracticePlanAccess from "../../models/practicePlanAccess";
import { app } from "../setup";
import { createVerifiedUser, getAccessToken } from "../utils/auth";

jest.setTimeout(30_000);

const authorizationFor = async (user: { id: string }) =>
  `Bearer ${await getAccessToken(user)}`;

describe("resource authorization HTTP mapping", () => {
  it("maps missing and insufficient authority to 401 and 403", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "private_owner@example.com",
    });
    const { user: unrelated } = await createVerifiedUser({
      email: "private_unrelated@example.com",
    });
    const tacticBoard = await TacticBoard.create({
      name: "Private Board",
      user: owner._id,
      isPrivate: true,
      pages: [],
    });

    const anonymousResponse = await request(app).get(
      `/api/tacticboards/${tacticBoard._id}`,
    );
    const unrelatedResponse = await request(app)
      .get(`/api/tacticboards/${tacticBoard._id}`)
      .set("Authorization", await authorizationFor(unrelated));

    expect(anonymousResponse.status).toBe(401);
    expect(unrelatedResponse.status).toBe(403);
  });

  it("prevents an Exercise editor from deleting or managing Access", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "exercise_owner@example.com",
    });
    const { user: editor } = await createVerifiedUser({
      email: "exercise_editor@example.com",
    });
    const { user: target } = await createVerifiedUser({
      email: "exercise_target@example.com",
    });
    const exercise = await Exercise.create({
      name: "Authorization Exercise",
      persons: 6,
      time_min: 10,
      user: owner._id,
    });
    await ExerciseAccess.create({
      user: editor._id,
      exercise: exercise._id,
      access: "edit",
    });
    const editorAuthorization = await authorizationFor(editor);

    const deleteResponse = await request(app)
      .delete(`/api/exercises/${exercise._id}`)
      .set("Authorization", editorAuthorization);
    const accessResponse = await request(app)
      .post(`/api/exercises/${exercise._id}/access`)
      .set("Authorization", editorAuthorization)
      .send({ userId: target._id, access: "edit" });

    expect(deleteResponse.status).toBe(403);
    expect(accessResponse.status).toBe(403);
  });

  it("prevents a TacticBoard editor from deleting or managing Access", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "board_owner@example.com",
    });
    const { user: editor } = await createVerifiedUser({
      email: "board_editor@example.com",
    });
    const { user: target } = await createVerifiedUser({
      email: "board_target@example.com",
    });
    const tacticBoard = await TacticBoard.create({
      name: "Authorization Board",
      user: owner._id,
      isPrivate: true,
      pages: [],
    });
    await TacticboardAccess.create({
      user: editor._id,
      tacticboard: tacticBoard._id,
      access: "edit",
    });
    const editorAuthorization = await authorizationFor(editor);

    const deleteResponse = await request(app)
      .delete(`/api/tacticboards/${tacticBoard._id}`)
      .set("Authorization", editorAuthorization);
    const accessResponse = await request(app)
      .post(`/api/tacticboards/${tacticBoard._id}/access`)
      .set("Authorization", editorAuthorization)
      .send({ userId: target._id, access: "view" });

    expect(deleteResponse.status).toBe(403);
    expect(accessResponse.status).toBe(403);
  });

  it("allows a TacticBoard editor to manage its Share Link", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "share_owner@example.com",
    });
    const { user: editor } = await createVerifiedUser({
      email: "share_editor@example.com",
    });
    const tacticBoard = await TacticBoard.create({
      name: "Shareable Board",
      user: owner._id,
      isPrivate: true,
      pages: [],
    });
    await TacticboardAccess.create({
      user: editor._id,
      tacticboard: tacticBoard._id,
      access: "edit",
    });
    const editorAuthorization = await authorizationFor(editor);

    const createResponse = await request(app)
      .post(`/api/tacticboards/${tacticBoard._id}/share-link`)
      .set("Authorization", editorAuthorization);
    const deleteResponse = await request(app)
      .delete(`/api/tacticboards/${tacticBoard._id}/share-link`)
      .set("Authorization", editorAuthorization);

    expect(createResponse.status).toBe(201);
    expect(deleteResponse.status).toBe(200);
  });

  it("allows a PracticePlan editor to edit but not delete or manage Access", async () => {
    const { user: owner } = await createVerifiedUser({
      email: "plan_contract_owner@example.com",
    });
    const { user: editor } = await createVerifiedUser({
      email: "plan_contract_editor@example.com",
    });
    const { user: target } = await createVerifiedUser({
      email: "plan_contract_target@example.com",
    });
    const practicePlan = await PracticePlan.create({
      name: "Authorization Plan",
      user: owner._id,
      isPrivate: true,
      sections: [],
    });
    await PracticePlanAccess.create({
      user: editor._id,
      practicePlan: practicePlan._id,
      access: "edit",
    });
    const editorAuthorization = await authorizationFor(editor);

    const editResponse = await request(app)
      .patch(`/api/practice-plans/${practicePlan._id}`)
      .set("Authorization", editorAuthorization)
      .send({ description: "Edited" });
    const deleteResponse = await request(app)
      .delete(`/api/practice-plans/${practicePlan._id}`)
      .set("Authorization", editorAuthorization);
    const accessResponse = await request(app)
      .post(`/api/practice-plans/${practicePlan._id}/access`)
      .set("Authorization", editorAuthorization)
      .send({ userId: target._id, access: "view" });

    expect(editResponse.status).toBe(200);
    expect(deleteResponse.status).toBe(403);
    expect(accessResponse.status).toBe(403);
  });
});
