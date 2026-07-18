/// <reference types="node" />

import process from "node:process";

import { MongoMemoryServer } from "mongodb-memory-server";
import { mongo } from "mongoose";

import { collectPreflight } from "./preflight";
import { connectForOperations } from "./reporting";
import {
  evaluateSyntheticGates,
  measureSynthetic,
  syntheticScale,
} from "./synthetic";

async function observedMaxima() {
  const { client, database } = await connectForOperations();
  try {
    const report = await collectPreflight(database);
    return {
      resources: Math.max(
        0,
        ...Object.values(report.collections).map((value) => value.cardinality),
      ),
      grantsPerActor: Math.max(
        0,
        ...Object.values(report.grants).map((value) => value.maximumPerActor),
      ),
    };
  } finally {
    await client.close();
  }
}

async function main(): Promise<void> {
  const scale = syntheticScale(await observedMaxima());
  const memoryServer = await MongoMemoryServer.create();
  const client = new mongo.MongoClient(memoryServer.getUri());
  try {
    await client.connect();
    const measurements = await measureSynthetic(
      client.db("collection-query-synthetic"),
      scale,
    );
    const gates = evaluateSyntheticGates(measurements);
    console.log(JSON.stringify({ scale, measurements, ...gates }, null, 2));
    if (gates.activation === "pause") process.exitCode = 2;
  } finally {
    await client.close();
    await memoryServer.stop();
  }
}

void main().catch((error: unknown) => {
  void error;
  console.error("Collection synthetic validation failed");
  process.exitCode = 1;
});
