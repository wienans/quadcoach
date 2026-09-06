import mongoose from "mongoose";
import Exercise from "../models/exercise";
import ExerciseAccess from "../models/exerciseAccess";
import TacticBoard from "../models/tacticBoard";
import TacticBoardAccess from "../models/tacticBoardAccess";

export type AccessLevel = "view" | "edit";

export interface ExerciseCardSummary {
  _id: string;
  name: string;
  tags: string[];
  creator?: string;
  createdAt?: Date;
  updatedAt?: Date;
  materials: string[];
  durationMinutes: number | null;
  persons: number | null;
  beaters: number | null;
  chasers: number | null;
  relatedTo: string[];
}

export interface TacticBoardCardSummary {
  _id: string;
  name: string;
  tags: string[];
  isPrivate: boolean;
  creator?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AccessibleRelationship<Summary> {
  item: Summary;
  accessLevel: AccessLevel;
}

export interface UserProfileSummaries<Summary> {
  owned: Summary[];
  accessible: AccessibleRelationship<Summary>[];
}

interface ExerciseSummaryDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  tags?: string[];
  creator?: string;
  createdAt?: Date;
  updatedAt?: Date;
  materials?: string[];
  time_min?: number | null;
  persons?: number | null;
  beaters?: number | null;
  chasers?: number | null;
  related_to?: mongoose.Types.ObjectId[];
}

interface TacticBoardSummaryDocument {
  _id: mongoose.Types.ObjectId;
  name: string;
  tags?: string[];
  isPrivate?: boolean;
  creator?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ExerciseAccessEntry {
  access?: unknown;
  exercise?: unknown;
}

interface TacticBoardAccessEntry {
  access?: unknown;
  tacticboard?: unknown;
}

interface ResourceAccessEntry {
  access?: unknown;
  resource?: unknown;
}

const ACCESS_LEVELS: readonly AccessLevel[] = ["view", "edit"];

function toAccessLevel(value: unknown): AccessLevel | null {
  return ACCESS_LEVELS.includes(value as AccessLevel)
    ? (value as AccessLevel)
    : null;
}

const exerciseSummarySelect =
  "_id name tags creator createdAt updatedAt materials time_min persons beaters chasers related_to";

const tacticBoardSummarySelect =
  "_id name tags isPrivate creator createdAt updatedAt";

function toExerciseCardSummary(
  document: ExerciseSummaryDocument,
): ExerciseCardSummary {
  return {
    _id: document._id.toString(),
    name: document.name,
    tags: document.tags ?? [],
    creator: document.creator,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    materials: document.materials ?? [],
    durationMinutes: document.time_min ?? null,
    persons: document.persons ?? null,
    beaters: document.beaters ?? null,
    chasers: document.chasers ?? null,
    relatedTo: (document.related_to ?? []).map(String),
  };
}

function toTacticBoardCardSummary(
  document: TacticBoardSummaryDocument,
): TacticBoardCardSummary {
  return {
    _id: document._id.toString(),
    name: document.name,
    tags: document.tags ?? [],
    isPrivate: document.isPrivate === true,
    creator: document.creator,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

function ownedAndAccessibleSummaries<Document, Summary>(
  ownedDocuments: Document[],
  accessEntries: ResourceAccessEntry[],
  toCardSummary: (document: Document) => Summary,
): UserProfileSummaries<Summary> {
  return {
    owned: ownedDocuments.map(toCardSummary),
    accessible: accessEntries
      .map((entry): AccessibleRelationship<Summary> | null => {
        const accessLevel = toAccessLevel(entry.access);
        const resource = entry.resource;
        if (accessLevel === null || resource === null || resource === undefined) {
          return null;
        }
        return { item: toCardSummary(resource as Document), accessLevel };
      })
      .filter(
        (relationship): relationship is AccessibleRelationship<Summary> =>
          relationship !== null,
      ),
  };
}

export async function getUserExerciseSummaries(
  userId: string,
): Promise<UserProfileSummaries<ExerciseCardSummary>> {
  const [ownedDocuments, accessEntries] = await Promise.all([
    Exercise.find({ user: userId })
      .select(exerciseSummarySelect)
      .lean(),
    ExerciseAccess.find({ user: userId })
      .populate({ path: "exercise", select: exerciseSummarySelect })
      .lean(),
  ]);
  return ownedAndAccessibleSummaries(
    ownedDocuments as ExerciseSummaryDocument[],
    (accessEntries as ExerciseAccessEntry[]).map(({ access, exercise }) => ({
      access,
      resource: exercise as ExerciseSummaryDocument | null,
    })),
    toExerciseCardSummary,
  );
}

export async function getUserTacticBoardSummaries(
  userId: string,
): Promise<UserProfileSummaries<TacticBoardCardSummary>> {
  const [ownedDocuments, accessEntries] = await Promise.all([
    TacticBoard.find({ user: userId })
      .select(tacticBoardSummarySelect)
      .lean(),
    TacticBoardAccess.find({ user: userId })
      .populate({ path: "tacticboard", select: tacticBoardSummarySelect })
      .lean(),
  ]);
  return ownedAndAccessibleSummaries(
    ownedDocuments as TacticBoardSummaryDocument[],
    (accessEntries as TacticBoardAccessEntry[]).map(
      ({ access, tacticboard }) => ({
        access,
        resource: tacticboard as TacticBoardSummaryDocument | null,
      }),
    ),
    toTacticBoardCardSummary,
  );
}
