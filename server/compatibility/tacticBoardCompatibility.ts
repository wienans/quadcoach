export type TacticBoardAccessLevel = "view" | "edit";

export interface LegacyTacticBoardFavoriteRequest {
  userId: string;
  tacticboardId: string;
}

export interface TacticBoardUserReference {
  userId: string;
  tacticBoardId: string;
}

export type TacticBoardFavoriteCommand = TacticBoardUserReference;

export interface TacticBoardAccessCommand extends TacticBoardUserReference {
  access: TacticBoardAccessLevel;
}

export interface LegacyTacticBoardReferencePersistence {
  user: string;
  tacticboard: string;
}

export interface LegacyTacticBoardAccessPersistence extends LegacyTacticBoardReferencePersistence {
  access: TacticBoardAccessLevel;
}

export function fromLegacyTacticBoardFavoriteRequest(
  request: LegacyTacticBoardFavoriteRequest,
): TacticBoardFavoriteCommand {
  return {
    userId: request.userId,
    tacticBoardId: request.tacticboardId,
  };
}

export function toLegacyTacticBoardFavoritePersistence(
  command: TacticBoardFavoriteCommand,
): LegacyTacticBoardReferencePersistence {
  return toLegacyTacticBoardReferencePersistence(command);
}

export function toLegacyTacticBoardReferencePersistence(
  reference: TacticBoardUserReference,
): LegacyTacticBoardReferencePersistence {
  return {
    user: reference.userId,
    tacticboard: reference.tacticBoardId,
  };
}

export function toLegacyTacticBoardAccessPersistence(
  command: TacticBoardAccessCommand,
): LegacyTacticBoardAccessPersistence {
  return {
    user: command.userId,
    tacticboard: command.tacticBoardId,
    access: command.access,
  };
}

export interface TacticBoardListDto<TacticBoard, Pagination> {
  tacticBoards: TacticBoard[];
  pagination: Pagination;
}

export interface LegacyTacticBoardListResponse<TacticBoard, Pagination> {
  tacticboards: TacticBoard[];
  pagination: Pagination;
}

export function toLegacyTacticBoardListResponse<TacticBoard, Pagination>(
  dto: TacticBoardListDto<TacticBoard, Pagination>,
): LegacyTacticBoardListResponse<TacticBoard, Pagination> {
  return {
    tacticboards: dto.tacticBoards,
    pagination: dto.pagination,
  };
}

export interface LegacyExerciseBlock extends Record<string, unknown> {
  tactics_board?: unknown;
}

export interface ExerciseBlockDto extends Record<string, unknown> {
  tacticBoardId?: unknown;
}

export interface LegacyExercise extends Record<string, unknown> {
  description_blocks?: LegacyExerciseBlock[];
}

export interface ExerciseDto extends Record<string, unknown> {
  descriptionBlocks?: ExerciseBlockDto[];
}

function fromLegacyExercise(exercise: LegacyExercise): ExerciseDto {
  const { description_blocks: descriptionBlocks, ...fields } = exercise;
  if (descriptionBlocks === undefined) {
    return fields;
  }

  return {
    ...fields,
    descriptionBlocks: descriptionBlocks.map((block) => {
      const { tactics_board: tacticBoardId, ...blockFields } = block;
      return tacticBoardId === undefined
        ? blockFields
        : { ...blockFields, tacticBoardId };
    }),
  };
}

function toLegacyExercise(exercise: ExerciseDto): LegacyExercise {
  const { descriptionBlocks, ...fields } = exercise;
  if (descriptionBlocks === undefined) {
    return fields;
  }

  return {
    ...fields,
    description_blocks: descriptionBlocks.map((block) => {
      const { tacticBoardId, ...blockFields } = block;
      return tacticBoardId === undefined
        ? blockFields
        : { ...blockFields, tactics_board: tacticBoardId };
    }),
  };
}

export function fromLegacyExerciseRequest(
  request: LegacyExercise,
): ExerciseDto {
  return fromLegacyExercise(request);
}

export function toLegacyExercisePersistence(dto: ExerciseDto): LegacyExercise {
  return toLegacyExercise(dto);
}

export function fromLegacyExercisePersistence(
  persistence: LegacyExercise,
): ExerciseDto {
  return fromLegacyExercise(persistence);
}

export function toLegacyExerciseResponse(dto: ExerciseDto): LegacyExercise {
  return toLegacyExercise(dto);
}
