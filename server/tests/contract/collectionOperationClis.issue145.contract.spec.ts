import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const cliCases = [
  {
    file: "preflightCli.ts",
    args: [],
    error: "Collection preflight failed",
  },
  {
    file: "syntheticCli.ts",
    args: [],
    error: "Collection synthetic validation failed",
  },
  {
    file: "indexCli.ts",
    args: ["create", "cq_tacticboards_name"],
    error: "Collection index operation failed",
  },
  {
    file: "indexCli.ts",
    args: ["verify", "cq_tacticboards_name"],
    error: "Collection index operation failed",
  },
  {
    file: "indexCli.ts",
    args: ["drop", "cq_tacticboards_name"],
    error: "Collection index operation failed",
  },
];

describe("collection operation CLI entrypoints", () => {
  it.each(cliCases)("typechecks and launches $file", ({ file, args, error }) => {
    const result = spawnSync(
      process.execPath,
      [
        path.join(process.cwd(), "node_modules/ts-node/dist/bin.js"),
        path.join("collectionQuery", "operations", file),
        ...args,
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, MONGO_URI: "invalid-uri-with-private-detail" },
        encoding: "utf8",
      },
    );

    expect(result.status).toBe(1);
    expect(result.stderr.trim()).toBe(error);
    expect(result.stderr).not.toContain("private-detail");
  });
});
