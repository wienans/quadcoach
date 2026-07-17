import { mkdtemp, mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { findStaleEmittedModules } from "../../scripts/verifyCleanArtifacts";

describe("clean artifact verification", () => {
  let fixtureRoot: string;

  beforeEach(async () => {
    fixtureRoot = await mkdtemp(path.join(tmpdir(), "quadcoach-artifacts-"));
    await mkdir(path.join(fixtureRoot, "controllers"));
  });

  afterEach(async () => {
    await rm(fixtureRoot, { recursive: true, force: true });
  });

  it("accepts emitted modules with an exact-case TypeScript source", async () => {
    await Promise.all([
      writeFile(path.join(fixtureRoot, "controllers", "tacticBoard.ts"), ""),
      writeFile(path.join(fixtureRoot, "controllers", "tacticBoard.js"), ""),
    ]);

    await expect(findStaleEmittedModules(fixtureRoot)).resolves.toEqual([]);
  });

  it("rejects stale JavaScript after a case or path rename", async () => {
    await Promise.all([
      writeFile(path.join(fixtureRoot, "controllers", "tacticBoard.ts"), ""),
      writeFile(path.join(fixtureRoot, "controllers", "Tacticboard.js"), ""),
      writeFile(
        path.join(fixtureRoot, "controllers", "removedController.js"),
        "",
      ),
    ]);

    await expect(findStaleEmittedModules(fixtureRoot)).resolves.toEqual([
      "controllers/Tacticboard.js",
      "controllers/removedController.js",
    ]);
  });
});
