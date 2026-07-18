/// <reference types="node" />

import process from "node:process";

import {
  createCollectionIndex,
  dropCollectionIndex,
  verifyCollectionIndex,
} from "./indexes";
import { connectForOperations } from "./reporting";

async function main(): Promise<void> {
  const [action, name, ...extra] = process.argv.slice(2);
  if (!name || extra.length || !["create", "verify", "drop"].includes(action)) {
    throw new Error(
      "Usage: collection:index:<create|verify|drop> -- <index-name>",
    );
  }
  const { client, database } = await connectForOperations();
  try {
    const result =
      action === "create"
        ? await createCollectionIndex(database, name)
        : action === "verify"
          ? await verifyCollectionIndex(database, name)
          : await dropCollectionIndex(database, name);
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await client.close();
  }
}

void main().catch((error: unknown) => {
  void error;
  console.error("Collection index operation failed");
  process.exitCode = 1;
});
