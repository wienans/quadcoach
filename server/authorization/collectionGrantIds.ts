import { mongo } from "mongoose";

import { CollectionResource } from "../collectionQuery/types";

type GrantedResource = Exclude<CollectionResource, "exercise">;

const accessPersistence: Readonly<
  Record<GrantedResource, { collection: string; resourceField: string }>
> = {
  tacticBoard: {
    collection: "tacticboardaccesses",
    resourceField: "tacticboard",
  },
  practicePlan: {
    collection: "practiceplanaccesses",
    resourceField: "practicePlan",
  },
};

function persistenceId(value: string): string | mongo.ObjectId {
  return mongo.ObjectId.isValid(value) ? new mongo.ObjectId(value) : value;
}

export async function loadAllCollectionGrantIds(
  database: mongo.Db,
  resource: GrantedResource,
  actorId: string,
): Promise<string[]> {
  const persistence = accessPersistence[resource];
  const grants = await database
    .collection(persistence.collection)
    .find(
      { user: persistenceId(actorId) },
      { projection: { _id: 0, [persistence.resourceField]: 1 } },
    )
    .toArray();

  return grants.flatMap((grant) => {
    const resourceId = grant[persistence.resourceField];
    return resourceId === undefined || resourceId === null
      ? []
      : [String(resourceId)];
  });
}
