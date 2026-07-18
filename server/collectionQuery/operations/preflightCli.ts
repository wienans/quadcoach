/// <reference types="node" />

import process from "node:process";

import { collectPreflight } from "./preflight";
import { connectForOperations } from "./reporting";

async function main(): Promise<void> {
  const { client, database } = await connectForOperations();
  try {
    console.log(JSON.stringify(await collectPreflight(database), null, 2));
  } finally {
    await client.close();
  }
}

void main().catch((error: unknown) => {
  void error;
  console.error("Collection preflight failed");
  process.exitCode = 1;
});
