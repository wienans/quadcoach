import TacticBoard from "../../models/tacticboard";
import TacticBoardAccess from "../../models/tacticboardAccess";
import { createVerifiedUser, getAccessToken } from "../utils/auth";

export type TacticBoardVisibilityScenarioName =
  | "anonymous"
  | "Owner"
  | "view-granted"
  | "edit-granted"
  | "hidden Private"
  | "legacy missing-isPrivate"
  | "mixed-case Admin";

export interface TacticBoardVisibilityScenario {
  name: TacticBoardVisibilityScenarioName;
  tacticBoardId: string;
  tacticBoardName: string;
  authorization?: string;
  expectedStatus: 200 | 403;
  ipAddress: string;
}

export interface TacticBoardVisibilityFixture {
  scenarios: TacticBoardVisibilityScenario[];
}

async function authorizationFor(user: { id: string }): Promise<string> {
  return `Bearer ${await getAccessToken(user)}`;
}

export async function createTacticBoardVisibilityFixture(): Promise<TacticBoardVisibilityFixture> {
  const [
    { user: owner },
    { user: viewer },
    { user: editor },
    { user: hiddenViewer },
    { user: admin },
  ] = await Promise.all([
    createVerifiedUser({ email: "visibility_owner@example.com" }),
    createVerifiedUser({ email: "visibility_viewer@example.com" }),
    createVerifiedUser({ email: "visibility_editor@example.com" }),
    createVerifiedUser({ email: "visibility_hidden@example.com" }),
    createVerifiedUser({ email: "visibility_admin@example.com" }),
  ]);
  admin.roles = ["AdMiN"];
  await admin.save();

  const [
    publicBoard,
    ownerBoard,
    viewBoard,
    editBoard,
    hiddenBoard,
    legacyBoard,
    adminBoard,
  ] = await Promise.all([
    TacticBoard.create({
      name: "Anonymous Board",
      isPrivate: false,
      user: owner._id,
    }),
    TacticBoard.create({
      name: "Owner Board",
      isPrivate: true,
      user: owner._id,
    }),
    TacticBoard.create({
      name: "View-granted Board",
      isPrivate: true,
      user: owner._id,
    }),
    TacticBoard.create({
      name: "Edit-granted Board",
      isPrivate: true,
      user: owner._id,
    }),
    TacticBoard.create({
      name: "Hidden Board",
      isPrivate: true,
      user: owner._id,
    }),
    TacticBoard.create({ name: "Legacy Board", user: owner._id }),
    TacticBoard.create({
      name: "Admin Board",
      isPrivate: true,
      user: owner._id,
    }),
  ]);

  await Promise.all([
    TacticBoardAccess.create({
      user: viewer._id,
      tacticboard: viewBoard._id,
      access: "view",
    }),
    TacticBoardAccess.create({
      user: editor._id,
      tacticboard: editBoard._id,
      access: "edit",
    }),
  ]);

  const [
    ownerAuthorization,
    viewerAuthorization,
    editorAuthorization,
    hiddenAuthorization,
    adminAuthorization,
  ] = await Promise.all([
    authorizationFor(owner),
    authorizationFor(viewer),
    authorizationFor(editor),
    authorizationFor(hiddenViewer),
    authorizationFor(admin),
  ]);

  return {
    scenarios: [
      {
        name: "anonymous",
        tacticBoardId: publicBoard.id,
        tacticBoardName: publicBoard.name ?? "",
        expectedStatus: 200,
        ipAddress: "198.51.100.10",
      },
      {
        name: "Owner",
        tacticBoardId: ownerBoard.id,
        tacticBoardName: ownerBoard.name ?? "",
        authorization: ownerAuthorization,
        expectedStatus: 200,
        ipAddress: "198.51.100.11",
      },
      {
        name: "view-granted",
        tacticBoardId: viewBoard.id,
        tacticBoardName: viewBoard.name ?? "",
        authorization: viewerAuthorization,
        expectedStatus: 200,
        ipAddress: "198.51.100.12",
      },
      {
        name: "edit-granted",
        tacticBoardId: editBoard.id,
        tacticBoardName: editBoard.name ?? "",
        authorization: editorAuthorization,
        expectedStatus: 200,
        ipAddress: "198.51.100.13",
      },
      {
        name: "hidden Private",
        tacticBoardId: hiddenBoard.id,
        tacticBoardName: hiddenBoard.name ?? "",
        authorization: hiddenAuthorization,
        expectedStatus: 403,
        ipAddress: "198.51.100.14",
      },
      {
        name: "legacy missing-isPrivate",
        tacticBoardId: legacyBoard.id,
        tacticBoardName: legacyBoard.name ?? "",
        expectedStatus: 200,
        ipAddress: "198.51.100.15",
      },
      {
        name: "mixed-case Admin",
        tacticBoardId: adminBoard.id,
        tacticBoardName: adminBoard.name ?? "",
        authorization: adminAuthorization,
        expectedStatus: 200,
        ipAddress: "198.51.100.16",
      },
    ],
  };
}
