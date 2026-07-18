import { access, readdir } from "fs/promises";
import path from "path";

const EXCLUDED_DIRECTORIES = new Set([
  ".git",
  "coverage",
  "dist",
  "logs",
  "node_modules",
]);

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectJavaScriptFiles(targetPath: string): Promise<string[]> {
  if (!(await pathExists(targetPath))) {
    return [];
  }
  if (path.extname(targetPath) === ".js") {
    return [targetPath];
  }

  const entries = await readdir(targetPath, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const entryPath = path.join(targetPath, entry.name);
      if (entry.isDirectory()) {
        if (EXCLUDED_DIRECTORIES.has(entry.name)) {
          return Promise.resolve([]);
        }
        return collectJavaScriptFiles(entryPath);
      }
      return Promise.resolve(entry.name.endsWith(".js") ? [entryPath] : []);
    }),
  );
  return nestedFiles.flat();
}

export async function findStaleEmittedModules(
  sourceRoot: string,
): Promise<string[]> {
  const emittedFiles = await collectJavaScriptFiles(sourceRoot);
  const staleFiles: string[] = [];

  for (const emittedFile of emittedFiles) {
    const sourceFile = `${emittedFile.slice(0, -3)}.ts`;
    if (!(await pathExists(sourceFile))) {
      staleFiles.push(
        path.relative(sourceRoot, emittedFile).split(path.sep).join("/"),
      );
    }
  }

  return staleFiles.sort();
}

async function verifyCleanArtifacts(): Promise<void> {
  const staleFiles = await findStaleEmittedModules(process.cwd());
  if (staleFiles.length === 0) {
    console.log("Clean artifact verification passed.");
    return;
  }

  console.error("Stale emitted JavaScript modules found:");
  for (const staleFile of staleFiles) {
    console.error(`- ${staleFile}`);
  }
  process.exitCode = 1;
}

if (require.main === module) {
  void verifyCleanArtifacts();
}
