import request from "supertest";
import { Types } from "mongoose";
import { app } from "../setup";

type HttpMethod = "delete" | "get" | "patch" | "post" | "put";

describe("permanent /api/tacticboards route inventory", () => {
  it("keeps public collection and protected mutation methods mounted", async () => {
    const tacticBoardId = new Types.ObjectId().toString();
    const pageId = new Types.ObjectId().toString();
    const routes: ReadonlyArray<{
      method: HttpMethod;
      path: string;
      expectedStatus: number;
    }> = [
      { method: "get", path: "/api/tacticboards/header", expectedStatus: 200 },
      { method: "get", path: "/api/tacticboards", expectedStatus: 200 },
      { method: "post", path: "/api/tacticboards", expectedStatus: 401 },
      {
        method: "put",
        path: `/api/tacticboards/${tacticBoardId}`,
        expectedStatus: 401,
      },
      {
        method: "delete",
        path: `/api/tacticboards/${tacticBoardId}`,
        expectedStatus: 401,
      },
      {
        method: "get",
        path: `/api/tacticboards/${tacticBoardId}/access`,
        expectedStatus: 401,
      },
      {
        method: "get",
        path: `/api/tacticboards/${tacticBoardId}/share-link`,
        expectedStatus: 401,
      },
      {
        method: "post",
        path: `/api/tacticboards/${tacticBoardId}/access`,
        expectedStatus: 401,
      },
      {
        method: "put",
        path: `/api/tacticboards/${tacticBoardId}/share-link`,
        expectedStatus: 401,
      },
      {
        method: "delete",
        path: `/api/tacticboards/${tacticBoardId}/access`,
        expectedStatus: 401,
      },
      {
        method: "get",
        path: `/api/tacticboards/${tacticBoardId}/checkAccess`,
        expectedStatus: 401,
      },
      {
        method: "post",
        path: `/api/tacticboards/${tacticBoardId}/share`,
        expectedStatus: 401,
      },
      {
        method: "post",
        path: `/api/tacticboards/${tacticBoardId}/duplicate`,
        expectedStatus: 401,
      },
      {
        method: "post",
        path: `/api/tacticboards/${tacticBoardId}/share-link`,
        expectedStatus: 401,
      },
      {
        method: "delete",
        path: `/api/tacticboards/${tacticBoardId}/share-link`,
        expectedStatus: 401,
      },
      {
        method: "patch",
        path: `/api/tacticboards/${tacticBoardId}/pages/${pageId}`,
        expectedStatus: 401,
      },
      {
        method: "delete",
        path: `/api/tacticboards/${tacticBoardId}/pages/${pageId}`,
        expectedStatus: 401,
      },
      {
        method: "patch",
        path: `/api/tacticboards/${tacticBoardId}/meta`,
        expectedStatus: 401,
      },
      {
        method: "post",
        path: `/api/tacticboards/${tacticBoardId}/newPage`,
        expectedStatus: 401,
      },
      {
        method: "post",
        path: `/api/tacticboards/${tacticBoardId}/insertPage/0`,
        expectedStatus: 401,
      },
    ];

    expect(routes).toHaveLength(20);
    for (const [index, route] of routes.entries()) {
      const response = await request(app)
        [route.method](route.path)
        .set("X-Forwarded-For", `203.0.113.${index + 1}`);
      expect({
        method: route.method,
        path: route.path,
        status: response.status,
      }).toEqual({
        method: route.method,
        path: route.path,
        status: route.expectedStatus,
      });
    }
  });
});
