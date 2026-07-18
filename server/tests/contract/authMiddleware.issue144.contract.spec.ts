import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../../app";
import User from "../../models/user";
import { verifyAdmin } from "../../middleware/verifyAdmin";
import verifyJWT from "../../middleware/verifyJWT";
import verifyJWTOptional from "../../middleware/verifyJWTOptional";

const accessSecret = () => process.env.ACCESS_TOKEN_SECRET as string;
const refreshSecret = () => process.env.REFRESH_TOKEN_SECRET as string;

const tokenFor = (
  roles: string[] = ["user"],
  options: jwt.SignOptions = { expiresIn: "15m" },
) =>
  jwt.sign(
    {
      UserInfo: {
        id: "actor-id",
        email: "actor@example.com",
        name: "Actor",
        roles,
      },
    },
    accessSecret(),
    options,
  );

const createApp = (middleware: typeof verifyJWTOptional) => {
  const app = express();
  app.get("/actor", middleware, (req, res) => {
    const actorRequest = req as typeof req & {
      UserInfo?: { id: string; roles: string[] };
    };
    res.json(actorRequest.UserInfo);
  });
  app.get("/admin", middleware, verifyAdmin, (_req, res) => {
    res.sendStatus(204);
  });
  return app;
};

describe.each([
  ["optional", verifyJWTOptional],
  ["required", verifyJWT],
] as const)("%s access-token authentication", (mode, middleware) => {
  const app = createApp(middleware);

  beforeEach(() => {
    jest.spyOn(User, "findOneAndUpdate").mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  if (mode === "optional") {
    it("continues anonymously only when credentials are absent", async () => {
      const response = await request(app).get("/actor");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ email: "", roles: [], name: "", id: "" });
      expect(User.findOneAndUpdate).not.toHaveBeenCalled();
    });
  } else {
    it("rejects absent credentials", async () => {
      const response = await request(app).get("/actor");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Unauthorized" });
    });
  }

  it.each(["Basic abc", "Bearer", "Bearer ", "Bearer one two"])(
    "rejects a supplied malformed credential: %s",
    async (authorization) => {
      const response = await request(app)
        .get("/actor")
        .set("Authorization", authorization);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Unauthorized" });
    },
  );

  it("rejects an invalid token", async () => {
    const token = jwt.sign({ UserInfo: {} }, "wrong-secret");

    const response = await request(app)
      .get("/actor")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Unauthorized" });
  });

  it("rejects an expired token", async () => {
    const response = await request(app)
      .get("/actor")
      .set("Authorization", `Bearer ${tokenFor(["user"], { expiresIn: -1 })}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Token expired" });
  });

  it("preserves a valid ordinary actor and records activity", async () => {
    const response = await request(app)
      .get("/actor")
      .set("Authorization", `Bearer ${tokenFor()}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "actor-id",
      email: "actor@example.com",
      name: "Actor",
      roles: ["user"],
    });
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "actor-id" }),
      { lastActivity: expect.any(Date) },
    );
  });

  it("preserves case-insensitive Admin authorization", async () => {
    const response = await request(app)
      .get("/admin")
      .set("Authorization", `Bearer ${tokenFor(["aDmIn"])}`);

    expect(response.status).toBe(204);
  });
});

describe("combined optional and required authentication", () => {
  it("reuses the verified actor and records activity once", async () => {
    const activity = jest
      .spyOn(User, "findOneAndUpdate")
      .mockResolvedValue(null);
    const app = express();
    app.get("/actor", verifyJWTOptional, verifyJWT, (_req, res) => {
      res.sendStatus(204);
    });

    const response = await request(app)
      .get("/actor")
      .set("Authorization", `Bearer ${tokenFor()}`);

    expect(response.status).toBe(204);
    expect(activity).toHaveBeenCalledTimes(1);
    jest.restoreAllMocks();
  });
});

describe("refresh HTTP contract", () => {
  it("recovers from an expired access token and preserves the actor", async () => {
    const actor = await User.create({
      name: "Admin Actor",
      email: "admin@example.com",
      password: "hashed-password",
      roles: ["user", "Admin"],
      isVerified: true,
    });
    const userInfo = {
      id: actor.id,
      email: actor.email,
      name: actor.name,
      roles: actor.roles,
    };
    const expiredAccessToken = jwt.sign(
      { UserInfo: userInfo },
      accessSecret(),
      { expiresIn: -1 },
    );

    const expiredResponse = await request(app)
      .get(`/api/user/${actor.id}`)
      .set("Authorization", `Bearer ${expiredAccessToken}`);

    expect(expiredResponse.status).toBe(401);
    expect(expiredResponse.body).toEqual({ message: "Token expired" });

    const refreshToken = jwt.sign(
      { email: actor.email },
      refreshSecret(),
      { expiresIn: "7d" },
    );
    const refreshResponse = await request(app)
      .get("/api/auth/refresh")
      .set("Cookie", `jwt=${refreshToken}`);

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.accessToken).toEqual(expect.any(String));
    expect(jwt.verify(refreshResponse.body.accessToken, accessSecret())).toEqual(
      expect.objectContaining({ UserInfo: userInfo }),
    );

    const recoveredResponse = await request(app)
      .get(`/api/user/${actor.id}`)
      .set("Authorization", `Bearer ${refreshResponse.body.accessToken}`);

    expect(recoveredResponse.status).toBe(200);
    expect(recoveredResponse.body).toEqual(
      expect.objectContaining({
        _id: actor.id,
        email: actor.email,
        name: actor.name,
        roles: ["user", "Admin"],
      }),
    );
  });
});
