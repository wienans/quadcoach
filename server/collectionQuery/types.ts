const intentBrand = Symbol("CollectionQueryIntent");
const visibilityBrand = Symbol("CollectionVisibility");

export type CollectionResource = "exercise" | "tacticBoard" | "practicePlan";
export type SortDirection = "asc" | "desc";
export type SelectionMode = "all" | "any";

export interface ValueSelection {
  readonly values: readonly string[];
  readonly mode: SelectionMode;
}

export interface IntegerRange {
  readonly minimum?: number;
  readonly maximum?: number;
}

type CommonSort = "name" | "created" | "updated";

interface CommonIntent<TSort extends string> {
  readonly search?: string;
  readonly tags?: ValueSelection;
  readonly sort: {
    readonly by: TSort;
    readonly direction: SortDirection;
  };
  readonly page: number;
  readonly limit: number;
}

export interface ExerciseIntentInput extends CommonIntent<
  CommonSort | "duration" | "persons"
> {
  readonly resource: "exercise";
  readonly materials?: ValueSelection;
  readonly persons?: IntegerRange;
  readonly duration?: IntegerRange;
  readonly beaters?: IntegerRange;
  readonly chasers?: IntegerRange;
}

export interface ExerciseIntent extends ExerciseIntentInput {
  readonly [intentBrand]: true;
}

export interface PrivateResourceIntentInput extends CommonIntent<CommonSort> {
  readonly resource: "tacticBoard" | "practicePlan";
  readonly privacy?: "public" | "private";
}

export interface PrivateResourceIntent extends PrivateResourceIntentInput {
  readonly [intentBrand]: true;
}

export type CollectionIntent = ExerciseIntent | PrivateResourceIntent;

export type CollectionVisibility =
  | { readonly kind: "all"; readonly [visibilityBrand]: true }
  | { readonly kind: "public"; readonly [visibilityBrand]: true }
  | {
      readonly kind: "publicOwnedOrGranted";
      readonly ownerId: string;
      readonly grantedResourceIds: readonly string[];
      readonly [visibilityBrand]: true;
    };

export const collectionVisibility = {
  all(): Extract<CollectionVisibility, { kind: "all" }> {
    return Object.freeze({ kind: "all", [visibilityBrand]: true as const });
  },
  public(): Extract<CollectionVisibility, { kind: "public" }> {
    return Object.freeze({ kind: "public", [visibilityBrand]: true as const });
  },
  publicOwnedOrGranted(
    ownerId: string,
    grantedResourceIds: readonly string[],
  ): Extract<CollectionVisibility, { kind: "publicOwnedOrGranted" }> {
    return Object.freeze({
      kind: "publicOwnedOrGranted",
      ownerId,
      grantedResourceIds: Object.freeze([...grantedResourceIds]),
      [visibilityBrand]: true as const,
    });
  },
};

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
    Object.freeze(value);
  }
  return value;
}

export function brandIntent(intent: ExerciseIntentInput): ExerciseIntent;
export function brandIntent(
  intent: PrivateResourceIntentInput,
): PrivateResourceIntent;
export function brandIntent(
  intent: ExerciseIntentInput | PrivateResourceIntentInput,
): CollectionIntent {
  return deepFreeze({
    ...intent,
    [intentBrand]: true as const,
  });
}

export function assertValidatedIntent(intent: CollectionIntent): void {
  if (intent[intentBrand] !== true) {
    throw new TypeError(
      "Collection intent was not produced by the transport parser",
    );
  }
}

export function assertCollectionVisibility(
  visibility: CollectionVisibility,
): void {
  if (visibility[visibilityBrand] !== true) {
    throw new TypeError(
      "Collection visibility was not produced by authorization",
    );
  }
}

export interface CollectionSummary {
  readonly _id: string;
  readonly name: string;
  readonly tags: readonly string[];
  readonly creator?: string;
  readonly user?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface CollectionPage<
  T extends CollectionSummary = CollectionSummary,
> {
  readonly items: readonly T[];
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly pages: number;
  };
}
