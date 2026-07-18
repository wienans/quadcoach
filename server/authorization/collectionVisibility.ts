import mongoose from "mongoose";

import {
  collectionVisibility,
  CollectionResource,
  CollectionVisibility,
} from "../collectionQuery/types";
import { loadAllCollectionGrantIds } from "./collectionGrantIds";

export interface CollectionActor {
  readonly id: string;
  readonly roles: readonly string[];
}

export async function decideCollectionVisibility(
  resource: CollectionResource,
  actor?: CollectionActor,
): Promise<CollectionVisibility> {
  if (resource === "exercise") return collectionVisibility.all();
  if (!actor) return collectionVisibility.public();
  if (actor.roles.some((role) => role.toLowerCase() === "admin")) {
    return collectionVisibility.all();
  }
  const database = mongoose.connection.db;
  if (!database) throw new Error("Authorization database is unavailable");
  const grantIds = await loadAllCollectionGrantIds(
    database,
    resource,
    actor.id,
  );
  return collectionVisibility.publicOwnedOrGranted(actor.id, grantIds);
}
