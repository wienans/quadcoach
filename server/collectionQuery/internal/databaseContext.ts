import { AsyncLocalStorage } from "node:async_hooks";
import { mongo } from "mongoose";

const collectionDatabase = new AsyncLocalStorage<mongo.Db>();

export function runWithCollectionDatabase<T>(
  database: mongo.Db,
  operation: () => Promise<T>,
): Promise<T> {
  return collectionDatabase.run(database, operation);
}

export function currentCollectionDatabase(): mongo.Db | undefined {
  return collectionDatabase.getStore();
}
