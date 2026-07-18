import type { Block, Exercise, ResourceAccessLevel } from "../domain";
import type { TacticBoardFavorite } from "../domain/Favorits";

export type TacticBoardFavoriteRequest = {
  userId: string;
  tacticBoardId: string;
};

export type TacticBoardFavoriteRequestDto = {
  userId: string;
  tacticboardId: string;
};

export type TacticBoardFavoriteResponseDto = {
  _id: string;
  user: string;
  tacticboard: string;
  createdAt: string | Date;
};

export type TacticBoardAccessRequest = {
  tacticBoardId: string;
  userId: string;
  access: ResourceAccessLevel;
};

export type TacticBoardAccessRequestDto = {
  userId: string;
  access: ResourceAccessLevel;
};

export type TacticBoardAccessEntryResponseDto = {
  _id?: string;
  user: {
    _id: string;
    name: string;
  };
  tacticboard: string;
  access: ResourceAccessLevel;
  createdAt: string | Date;
  __v?: number;
};

export type TacticBoardAccessEntry = {
  user: {
    _id: string;
    name: string;
  };
  tacticBoardId: string;
  access: ResourceAccessLevel;
  createdAt: string | Date;
};

export type TacticBoardAccessMutationResponseDto = {
  _id?: string;
  user: string;
  tacticboard: string;
  access: ResourceAccessLevel;
  createdAt: string | Date;
  __v?: number;
};

export type TacticBoardAccessMutationResponse = {
  userId: string;
  tacticBoardId: string;
  access: ResourceAccessLevel;
  createdAt: string | Date;
};

export type TacticBoardAccessDeleteRequest = {
  tacticBoardId: string;
  userId: string;
};

export type TacticBoardAccessDeleteRequestDto = {
  userId: string;
};

export const toTacticBoardFavoriteRequestDto = ({
  userId,
  tacticBoardId,
}: TacticBoardFavoriteRequest): TacticBoardFavoriteRequestDto => ({
  userId,
  tacticboardId: tacticBoardId,
});

export const fromTacticBoardFavoriteResponseDto = ({
  _id,
  user,
  tacticboard,
  createdAt,
}: TacticBoardFavoriteResponseDto): TacticBoardFavorite => ({
  _id,
  user,
  tacticBoardId: tacticboard,
  createdAt,
});

export const toTacticBoardAccessRequestDto = ({
  userId,
  access,
}: TacticBoardAccessRequest): TacticBoardAccessRequestDto => ({
  userId,
  access,
});

export const fromTacticBoardAccessEntryResponseDto = ({
  user,
  tacticboard,
  access,
  createdAt,
}: TacticBoardAccessEntryResponseDto): TacticBoardAccessEntry => ({
  user: { _id: user._id, name: user.name },
  tacticBoardId: tacticboard,
  access,
  createdAt,
});

export const fromTacticBoardAccessMutationResponseDto = ({
  user,
  tacticboard,
  access,
  createdAt,
}: TacticBoardAccessMutationResponseDto): TacticBoardAccessMutationResponse => ({
  userId: user,
  tacticBoardId: tacticboard,
  access,
  createdAt,
});

export const toTacticBoardAccessDeleteRequestDto = ({
  userId,
}: TacticBoardAccessDeleteRequest): TacticBoardAccessDeleteRequestDto => ({
  userId,
});

export type TacticBoardCollectionResponseDto<T> = {
  tacticboards: T[];
  pagination: {
    page: number;
    limit?: number;
    total: number;
    pages: number;
  };
};

export type TacticBoardCollectionResponse<T> = {
  tacticBoards: T[];
  pagination: TacticBoardCollectionResponseDto<T>["pagination"];
};

export const fromTacticBoardCollectionResponseDto = <T>({
  tacticboards,
  pagination,
}: TacticBoardCollectionResponseDto<T>): TacticBoardCollectionResponse<T> => ({
  tacticBoards: tacticboards,
  pagination,
});

type ExerciseBlockDto = Omit<Block, "tacticBoardId"> & {
  tactics_board?: string;
};

export type ExerciseResponseDto = Omit<Exercise, "description_blocks"> & {
  description_blocks: ExerciseBlockDto[];
};

const fromExerciseBlockDto = ({
  tactics_board: tacticBoardId,
  ...block
}: ExerciseBlockDto): Block => ({
  ...block,
  ...(tacticBoardId === undefined ? {} : { tacticBoardId }),
});

const toExerciseBlockDto = ({
  tacticBoardId,
  ...block
}: Block): ExerciseBlockDto => ({
  ...block,
  ...(tacticBoardId === undefined ? {} : { tactics_board: tacticBoardId }),
});

export const fromExerciseResponseDto = ({
  description_blocks,
  ...exercise
}: ExerciseResponseDto): Exercise => ({
  ...exercise,
  description_blocks: description_blocks.map(fromExerciseBlockDto),
});

export const toExerciseRequestDto = <T extends Omit<Exercise, "_id"> | Exercise>(
  exercise: T,
): Omit<T, "description_blocks"> & { description_blocks: ExerciseBlockDto[] } => {
  const { description_blocks, ...fields } = exercise;
  return {
    ...fields,
    description_blocks: description_blocks.map(toExerciseBlockDto),
  };
};
