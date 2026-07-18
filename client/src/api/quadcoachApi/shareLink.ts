import type { TacticBoard } from "./domain";
import type { PracticePlanEntityPartialId } from "./domain/PracticePlan";
import type { TacticBoardObject } from "../../contexts/tacticBoard/TacticBoardFabricJsContext/tacticBoardTypes";

export type ShareLinkStatusResponse =
  | { status: "inactive" }
  | { status: "active"; shareLink: string };

export type ShareLinkEnsureResponse = {
  status: "created" | "existing";
  shareLink: string;
};

export type ShareLinkRotateResponse = {
  status: "rotated";
  shareLink: string;
};

export type ShareLinkRevokeResponse = {
  status: "inactive";
};

export const TACTIC_BOARD_SHARED_READ_TAG_ID = "tacticboard-shared-read";
export const PRACTICE_PLAN_SHARED_READ_TAG_ID = "practiceplan-shared-read";

export interface SharedTacticBoardObjectDto {
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
  strokeDashArray?: number[];
  strokeLineCap?: string;
  strokeDashOffset?: number;
  strokeLineJoin?: string;
  strokeUniform?: boolean;
  strokeMiterLimit?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
  objects?: SharedTacticBoardObjectDto[];
  visible?: boolean;
  backgroundColor?: string;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  path?: (string | number)[][];
  text?: string;
  originX?: string;
  originY?: string;
  fontFamily?: string;
  fontSize?: number;
  textAlign?: string;
  objectType?: string;
}

export interface SharedTacticBoardBackgroundImageDto {
  type?: string;
  width?: number;
  height?: number;
  src?: string;
}

export interface SharedTacticBoardPageDto {
  version?: string;
  objects?: SharedTacticBoardObjectDto[];
  backgroundImage?:
    | SharedTacticBoardBackgroundImageDto
    | SharedTacticBoardBackgroundImageDto[];
}

export interface SharedTacticBoardDto {
  kind: "tacticBoard";
  name?: string;
  tags?: string[];
  pages?: SharedTacticBoardPageDto[];
  creator?: string;
  description?: string;
  coaching_points?: string;
}

export interface SharedPracticePlanItemDto {
  kind: "exercise" | "break";
  description?: string;
  exerciseId?: string;
  blockId?: string;
  duration?: number;
}

export interface SharedPracticePlanGroupDto {
  name: string;
  items: SharedPracticePlanItemDto[];
}

export interface SharedPracticePlanSectionDto {
  name: string;
  targetDuration: number;
  groups: SharedPracticePlanGroupDto[];
}

export interface SharedPracticePlanDto {
  kind: "practicePlan";
  name: string;
  description?: string;
  tags: string[];
  sections: SharedPracticePlanSectionDto[];
}

const toRenderableObject = (
  object: SharedTacticBoardObjectDto,
  path: string,
): TacticBoardObject => ({
  ...object,
  uuid: object.uuid ?? path,
  objects: object.objects?.map((child, index) =>
    toRenderableObject(child, `${path}-${index}`),
  ),
});

export const toRenderableTacticBoard = (
  board: SharedTacticBoardDto,
  token: string,
): TacticBoard => ({
  _id: `shared-${token}`,
  name: board.name,
  tags: board.tags,
  creator: board.creator,
  description: board.description,
  coaching_points: board.coaching_points,
  pages: (board.pages ?? []).map((page, pageIndex) => {
    const projectedBackground = Array.isArray(page.backgroundImage)
      ? page.backgroundImage[0]
      : page.backgroundImage;
    return {
      _id: `shared-page-${pageIndex}`,
      version: page.version,
      objects: page.objects?.map((object, objectIndex) =>
        toRenderableObject(object, `shared-object-${pageIndex}-${objectIndex}`),
      ),
      backgroundImage: {
        type: projectedBackground?.type ?? "",
        width: projectedBackground?.width ?? 0,
        height: projectedBackground?.height ?? 0,
        src: projectedBackground?.src ?? "",
      },
    };
  }),
});

export const toReadOnlyPracticePlan = (
  plan: SharedPracticePlanDto,
): PracticePlanEntityPartialId => ({
  name: plan.name,
  description: plan.description,
  tags: plan.tags,
  user: "",
  isPrivate: true,
  sections: plan.sections.map((section) => ({
    name: section.name,
    targetDuration: section.targetDuration,
    groups: section.groups.map((group) => ({
      name: group.name,
      items: group.items.map((item) =>
        item.kind === "break"
          ? {
              kind: "break",
              description: item.description ?? "",
              duration: item.duration ?? 0,
            }
          : {
              kind: "exercise",
              exerciseId: item.exerciseId ?? "",
              blockId: item.blockId ?? "",
              duration: item.duration ?? 0,
            },
      ),
    })),
  })),
});
