import mongoose from "mongoose";
import { PracticePlan } from "../models/practicePlan";
import TacticBoard from "../models/tacticBoard";
import {
  projectPracticePlan,
  projectTacticBoard,
  SharedPracticePlan,
  SharedTacticBoard,
} from "./shareLinkProjections";
import {
  EnsureShareLinkResult,
  PublishShareLinkResult,
  RevokeShareLinkResult,
  RotateShareLinkResult,
  ShareLinkPersistenceAdapter,
  ShareLinkResourceState,
} from "./shareLinks";

export {
  SharedPracticePlan,
  SharedPracticePlanGroup,
  SharedPracticePlanItem,
  SharedPracticePlanSection,
  SharedTacticBoard,
  SharedTacticBoardBackgroundImage,
  SharedTacticBoardObject,
  SharedTacticBoardPage,
} from "./shareLinkProjections";

export interface TacticBoardPublishMetadata {
  name?: string;
  tags?: readonly string[];
  description?: string;
  coaching_points?: string;
}

export interface PracticePlanPublishMetadata {
  name?: string;
  description?: string;
  tags?: readonly string[];
}

export type ProductionShareLinkResourceTypes = {
  tacticBoard: {
    publishMetadata: TacticBoardPublishMetadata;
    sharedResource: SharedTacticBoard;
  };
  practicePlan: {
    publishMetadata: PracticePlanPublishMetadata;
    sharedResource: SharedPracticePlan;
  };
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const ownDefinedFields = (
  source: UnknownRecord,
  fields: readonly string[],
): UnknownRecord =>
  Object.fromEntries(
    fields
      .filter(
        (field) =>
          Object.prototype.hasOwnProperty.call(source, field) &&
          source[field] !== undefined,
      )
      .map((field) => [field, source[field]]),
  );

export function isRelevantShareTokenDuplicateKeyError(
  error: unknown,
  collectionName: string,
): boolean {
  if (!isRecord(error)) return false;
  if (error.code !== 11000) return false;
  if (!isRecord(error.keyPattern) || !isRecord(error.keyValue)) {
    return false;
  }
  if (
    Object.keys(error.keyPattern).length !== 1 ||
    error.keyPattern.shareToken !== 1 ||
    Object.keys(error.keyValue).length !== 1 ||
    !Object.prototype.hasOwnProperty.call(error.keyValue, "shareToken")
  ) {
    return false;
  }
  return (
    typeof error.ns !== "string" ||
    error.ns === collectionName ||
    error.ns.endsWith(`.${collectionName}`)
  );
}

const stateFromDocument = (value: unknown): ShareLinkResourceState | null => {
  if (!isRecord(value)) return null;
  return {
    ownerId: value.user === undefined ? undefined : String(value.user),
    isPrivate: value.isPrivate === true,
    activeToken:
      typeof value.shareToken === "string" && value.shareToken.length > 0
        ? value.shareToken
        : undefined,
  };
};

const inactiveTokenFilter = {
  $or: [
    { shareToken: { $exists: false } },
    { shareToken: null },
    { shareToken: "" },
  ],
};

const outcomeForCurrentState = async (
  inspect: (id: string) => Promise<ShareLinkResourceState | null>,
  id: string,
): Promise<"missing" | "public" | "inactive" | "active"> => {
  const state = await inspect(id);
  if (!state) return "missing";
  if (!state.isPrivate) return "public";
  return state.activeToken ? "active" : "inactive";
};

interface AdapterModelOperations<SharedResource> {
  collectionName: string;
  inspect(id: string): Promise<unknown>;
  install(id: string, candidateToken: string): Promise<unknown>;
  replace(
    id: string,
    expectedToken: string,
    candidateToken: string,
  ): Promise<unknown>;
  remove(id: string): Promise<{ matchedCount: number; modifiedCount: number }>;
  makePublic(
    id: string,
    metadata: UnknownRecord,
  ): Promise<{ matchedCount: number }>;
  resolve(token: string): Promise<unknown>;
  project(value: unknown): SharedResource | null;
}

const createAdapter = <Metadata extends object, SharedResource>(
  operations: AdapterModelOperations<SharedResource>,
  publishFields: readonly (keyof Metadata & string)[],
): ShareLinkPersistenceAdapter<Metadata, SharedResource> => {
  const inspect = async (id: string): Promise<ShareLinkResourceState | null> =>
    stateFromDocument(await operations.inspect(id));

  const ensure = async (
    id: string,
    candidateToken: string,
  ): Promise<EnsureShareLinkResult> => {
    while (true) {
      try {
        const installed = await operations.install(id, candidateToken);
        if (installed) return { outcome: "created", token: candidateToken };
      } catch (error) {
        if (
          isRelevantShareTokenDuplicateKeyError(error, operations.collectionName)
        ) {
          return { outcome: "collision" };
        }
        throw error;
      }

      const state = await inspect(id);
      if (!state) return { outcome: "missing" };
      if (!state.isPrivate) return { outcome: "public" };
      if (state.activeToken) {
        return { outcome: "existing", token: state.activeToken };
      }
      // A state-changing operation won between the write and read. Retry at a
      // fresh MongoDB linearization point instead of returning a false status.
    }
  };

  return {
    isValidId: mongoose.isValidObjectId,
    inspect,
    ensure,
    async rotate(
      id,
      expectedToken,
      candidateToken,
    ): Promise<RotateShareLinkResult> {
      try {
        const replaced = await operations.replace(
          id,
          expectedToken,
          candidateToken,
        );
        if (replaced) return { outcome: "rotated", token: candidateToken };
      } catch (error) {
        if (
          isRelevantShareTokenDuplicateKeyError(error, operations.collectionName)
        ) {
          return { outcome: "collision" };
        }
        throw error;
      }

      const state = await outcomeForCurrentState(inspect, id);
      if (state === "active") return { outcome: "conflict" };
      return { outcome: state };
    },
    async revoke(id): Promise<RevokeShareLinkResult> {
      while (true) {
        const result = await operations.remove(id);
        if (result.matchedCount > 0) {
          return {
            outcome: result.modifiedCount > 0 ? "revoked" : "inactive",
          };
        }
        const state = await outcomeForCurrentState(inspect, id);
        if (state === "inactive") return { outcome: "inactive" };
        if (state === "missing" || state === "public") {
          return { outcome: state };
        }
      }
    },
    async publish(id, metadata): Promise<PublishShareLinkResult> {
      const allowedMetadata = isRecord(metadata)
        ? ownDefinedFields(metadata, publishFields)
        : {};
      while (true) {
        const result = await operations.makePublic(id, allowedMetadata);
        if (result.matchedCount > 0) return { outcome: "published" };
        const state = await outcomeForCurrentState(inspect, id);
        if (state === "missing" || state === "public") {
          return { outcome: state };
        }
      }
    },
    async resolveActivePrivate(token): Promise<SharedResource | null> {
      return operations.project(await operations.resolve(token));
    },
  };
};

const stateProjection = {
  _id: 0,
  user: 1,
  isPrivate: 1,
  shareToken: 1,
};

export const createTacticBoardShareLinkAdapter = (): ShareLinkPersistenceAdapter<
  TacticBoardPublishMetadata,
  SharedTacticBoard
> =>
  createAdapter<TacticBoardPublishMetadata, SharedTacticBoard>(
    {
      collectionName: TacticBoard.collection.collectionName,
      inspect: (id) =>
        TacticBoard.findById(id).select(stateProjection).lean().exec(),
      install: (id, candidateToken) =>
        TacticBoard.findOneAndUpdate(
          { _id: id, isPrivate: true, ...inactiveTokenFilter },
          { $set: { shareToken: candidateToken } },
          {
            returnDocument: "after",
            projection: { _id: 1 },
            runValidators: true,
          },
        )
          .lean()
          .exec(),
      replace: (id, expectedToken, candidateToken) =>
        TacticBoard.findOneAndUpdate(
          { _id: id, isPrivate: true, shareToken: expectedToken },
          { $set: { shareToken: candidateToken } },
          {
            returnDocument: "after",
            projection: { _id: 1 },
            runValidators: true,
          },
        )
          .lean()
          .exec(),
      remove: (id) =>
        TacticBoard.updateOne(
          { _id: id, isPrivate: true },
          { $unset: { shareToken: 1 } },
        ).exec(),
      makePublic: (id, metadata) =>
        TacticBoard.updateOne(
          { _id: id, isPrivate: true },
          {
            $set: { ...metadata, isPrivate: false },
            $unset: { shareToken: 1 },
          },
          { runValidators: true },
        ).exec(),
      resolve: (token) =>
        TacticBoard.findOne({ isPrivate: true, shareToken: token })
          .select({
            _id: 0,
            name: 1,
            tags: 1,
            pages: 1,
            creator: 1,
            description: 1,
            coaching_points: 1,
          })
          .lean()
          .exec(),
      project: projectTacticBoard,
    },
    ["name", "tags", "description", "coaching_points"],
  );

export const createPracticePlanShareLinkAdapter = (): ShareLinkPersistenceAdapter<
  PracticePlanPublishMetadata,
  SharedPracticePlan
> =>
  createAdapter<PracticePlanPublishMetadata, SharedPracticePlan>(
    {
      collectionName: PracticePlan.collection.collectionName,
      inspect: (id) =>
        PracticePlan.findById(id).select(stateProjection).lean().exec(),
      install: (id, candidateToken) =>
        PracticePlan.findOneAndUpdate(
          { _id: id, isPrivate: true, ...inactiveTokenFilter },
          { $set: { shareToken: candidateToken } },
          {
            returnDocument: "after",
            projection: { _id: 1 },
            runValidators: true,
          },
        )
          .lean()
          .exec(),
      replace: (id, expectedToken, candidateToken) =>
        PracticePlan.findOneAndUpdate(
          { _id: id, isPrivate: true, shareToken: expectedToken },
          { $set: { shareToken: candidateToken } },
          {
            returnDocument: "after",
            projection: { _id: 1 },
            runValidators: true,
          },
        )
          .lean()
          .exec(),
      remove: (id) =>
        PracticePlan.updateOne(
          { _id: id, isPrivate: true },
          { $unset: { shareToken: 1 } },
        ).exec(),
      makePublic: (id, metadata) =>
        PracticePlan.updateOne(
          { _id: id, isPrivate: true },
          {
            $set: { ...metadata, isPrivate: false },
            $unset: { shareToken: 1 },
          },
          { runValidators: true },
        ).exec(),
      resolve: (token) =>
        PracticePlan.findOne({ isPrivate: true, shareToken: token })
          .select({
            _id: 0,
            name: 1,
            description: 1,
            tags: 1,
            sections: 1,
          })
          .lean()
          .exec(),
      project: projectPracticePlan,
    },
    ["name", "description", "tags"],
  );

export const createMongoShareLinkPersistenceAdapters = () => ({
  tacticBoard: createTacticBoardShareLinkAdapter(),
  practicePlan: createPracticePlanShareLinkAdapter(),
});
