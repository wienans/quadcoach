import mongoose from "mongoose";
import { PracticePlan } from "../models/practicePlan";
import TacticBoard from "../models/tacticBoard";
import {
  EnsureShareLinkResult,
  PublishShareLinkResult,
  RevokeShareLinkResult,
  RotateShareLinkResult,
  ShareLinkPersistenceAdapter,
  ShareLinkResourceState,
} from "./shareLinks";

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

export interface SharedTacticBoardObject {
  uuid?: string;
  type: string;
  left: number;
  top: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: readonly number[];
  strokeLineCap?: string;
  strokeDashOffset?: number;
  strokeLineJoin?: string;
  strokeUniform?: boolean;
  strokeMiterLimit?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
  objects?: readonly SharedTacticBoardObject[];
  visible?: boolean;
  backgroundColor?: string;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  path?: readonly (readonly (string | number)[])[];
  text?: string;
  originX?: string;
  originY?: string;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: string;
  objectType?: string;
}

export interface SharedTacticBoardBackgroundImage {
  type?: string;
  width?: number;
  height?: number;
  src?: string;
}

export interface SharedTacticBoardPage {
  version?: string;
  objects?: readonly SharedTacticBoardObject[];
  backgroundImage?:
    | SharedTacticBoardBackgroundImage
    | readonly SharedTacticBoardBackgroundImage[];
}

export interface SharedTacticBoard {
  kind: "tacticBoard";
  name?: string;
  tags?: readonly string[];
  pages?: readonly SharedTacticBoardPage[];
  creator?: string;
  description?: string;
  coaching_points?: string;
}

export interface SharedPracticePlanItem {
  kind: "exercise" | "break";
  description?: string;
  exerciseId?: string;
  blockId?: string;
  duration?: number;
}

export interface SharedPracticePlanGroup {
  name: string;
  items: readonly SharedPracticePlanItem[];
}

export interface SharedPracticePlanSection {
  name: string;
  targetDuration: number;
  groups: readonly SharedPracticePlanGroup[];
}

export interface SharedPracticePlan {
  kind: "practicePlan";
  name: string;
  description?: string;
  tags: readonly string[];
  sections: readonly SharedPracticePlanSection[];
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

const TACTIC_BOARD_OBJECT_FIELDS = [
  "uuid",
  "type",
  "left",
  "top",
  "x1",
  "y1",
  "x2",
  "y2",
  "width",
  "height",
  "fill",
  "stroke",
  "strokeWidth",
  "strokeDashArray",
  "strokeLineCap",
  "strokeDashOffset",
  "strokeLineJoin",
  "strokeUniform",
  "strokeMiterLimit",
  "scaleX",
  "scaleY",
  "angle",
  "opacity",
  "visible",
  "backgroundColor",
  "radius",
  "startAngle",
  "endAngle",
  "path",
  "text",
  "originX",
  "originY",
  "fontFamily",
  "fontSize",
  "textAlign",
  "objectType",
] as const;

const projectTacticBoardObject = (
  value: unknown,
): SharedTacticBoardObject | null => {
  if (!isRecord(value)) return null;
  const projected = ownDefinedFields(value, TACTIC_BOARD_OBJECT_FIELDS);
  if (Array.isArray(value.objects)) {
    projected.objects = value.objects
      .map(projectTacticBoardObject)
      .filter((item): item is SharedTacticBoardObject => item !== null);
  }
  return projected as unknown as SharedTacticBoardObject;
};

const projectBackgroundImage = (
  value: unknown,
): SharedTacticBoardBackgroundImage | null => {
  if (!isRecord(value)) return null;
  return ownDefinedFields(value, [
    "type",
    "width",
    "height",
    "src",
  ]) as SharedTacticBoardBackgroundImage;
};

const projectTacticBoardPage = (
  value: unknown,
): SharedTacticBoardPage | null => {
  if (!isRecord(value)) return null;
  const projected = ownDefinedFields(value, ["version"]);
  if (Array.isArray(value.objects)) {
    projected.objects = value.objects
      .map(projectTacticBoardObject)
      .filter((item): item is SharedTacticBoardObject => item !== null);
  }
  if (Array.isArray(value.backgroundImage)) {
    projected.backgroundImage = value.backgroundImage
      .map(projectBackgroundImage)
      .filter(
        (item): item is SharedTacticBoardBackgroundImage => item !== null,
      );
  } else {
    const backgroundImage = projectBackgroundImage(value.backgroundImage);
    if (backgroundImage) projected.backgroundImage = backgroundImage;
  }
  return projected as SharedTacticBoardPage;
};

const projectTacticBoard = (value: unknown): SharedTacticBoard | null => {
  if (!isRecord(value)) return null;
  const projected: UnknownRecord = {
    kind: "tacticBoard",
    ...ownDefinedFields(value, [
      "name",
      "tags",
      "creator",
      "description",
      "coaching_points",
    ]),
  };
  if (Array.isArray(value.pages)) {
    projected.pages = value.pages
      .map(projectTacticBoardPage)
      .filter((page): page is SharedTacticBoardPage => page !== null);
  }
  return projected as unknown as SharedTacticBoard;
};

const projectPracticePlanItem = (
  value: unknown,
): SharedPracticePlanItem | null => {
  if (!isRecord(value)) return null;
  const projected = ownDefinedFields(value, ["kind", "description", "duration"]);
  if (value.exerciseId !== undefined) {
    projected.exerciseId = String(value.exerciseId);
  }
  if (value.blockId !== undefined) projected.blockId = String(value.blockId);
  return projected as unknown as SharedPracticePlanItem;
};

const projectPracticePlanGroup = (
  value: unknown,
): SharedPracticePlanGroup | null => {
  if (!isRecord(value)) return null;
  return {
    ...(ownDefinedFields(value, ["name"]) as { name: string }),
    items: Array.isArray(value.items)
      ? value.items
          .map(projectPracticePlanItem)
          .filter((item): item is SharedPracticePlanItem => item !== null)
      : [],
  };
};

const projectPracticePlanSection = (
  value: unknown,
): SharedPracticePlanSection | null => {
  if (!isRecord(value)) return null;
  return {
    ...(ownDefinedFields(value, ["name", "targetDuration"]) as {
      name: string;
      targetDuration: number;
    }),
    groups: Array.isArray(value.groups)
      ? value.groups
          .map(projectPracticePlanGroup)
          .filter((group): group is SharedPracticePlanGroup => group !== null)
      : [],
  };
};

const projectPracticePlan = (value: unknown): SharedPracticePlan | null => {
  if (!isRecord(value)) return null;
  return {
    kind: "practicePlan",
    ...(ownDefinedFields(value, ["name", "description", "tags"]) as {
      name: string;
      description?: string;
      tags: string[];
    }),
    sections: Array.isArray(value.sections)
      ? value.sections
          .map(projectPracticePlanSection)
          .filter(
            (section): section is SharedPracticePlanSection => section !== null,
          )
      : [],
  };
};

interface MongoDuplicateKeyError {
  code?: unknown;
  keyPattern?: unknown;
  keyValue?: unknown;
  ns?: unknown;
}

export function isRelevantShareTokenDuplicateKeyError(
  error: unknown,
  collectionName: string,
): boolean {
  if (!isRecord(error)) return false;
  const duplicate = error as MongoDuplicateKeyError;
  if (duplicate.code !== 11000) return false;
  if (!isRecord(duplicate.keyPattern) || !isRecord(duplicate.keyValue)) {
    return false;
  }
  if (
    Object.keys(duplicate.keyPattern).length !== 1 ||
    duplicate.keyPattern.shareToken !== 1 ||
    Object.keys(duplicate.keyValue).length !== 1 ||
    !Object.prototype.hasOwnProperty.call(duplicate.keyValue, "shareToken")
  ) {
    return false;
  }
  return (
    typeof duplicate.ns !== "string" ||
    duplicate.ns === collectionName ||
    duplicate.ns.endsWith(`.${collectionName}`)
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
      const allowedMetadata = ownDefinedFields(
        metadata as UnknownRecord,
        publishFields,
      );
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
