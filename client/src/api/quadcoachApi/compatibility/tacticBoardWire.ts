import type { ResourceAccessLevel, TacticPage } from "../domain";

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

export type TacticBoardFavorite = {
  _id: string;
  user: string;
  tacticBoardId: string;
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
  user: {
    _id: string;
    name: string;
  };
  tacticboard: string;
  access: ResourceAccessLevel;
  createdAt: string | Date;
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
  user: string;
  tacticboard: string;
  access: ResourceAccessLevel;
  createdAt: string | Date;
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

export type ExerciseBlock = {
  _id: string;
  video_url?: string;
  description?: string;
  coaching_points?: string;
  tacticBoardId?: string;
  time_min: number;
};

export type ExerciseBlockDto = {
  _id: string;
  video_url?: string;
  description?: string;
  coaching_points?: string;
  tactics_board?: string;
  time_min: number;
};

export type TacticBoardRequest = {
  name?: string;
  isPrivate?: boolean;
  tags?: string[];
  pages: TacticPage[];
  description?: string;
  coaching_points?: string;
};

export type TacticBoardRequestDto = TacticBoardRequest;

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

export const toExerciseBlockDto = ({
  _id,
  video_url,
  description,
  coaching_points,
  tacticBoardId,
  time_min,
}: ExerciseBlock): ExerciseBlockDto => ({
  _id,
  video_url,
  description,
  coaching_points,
  tactics_board: tacticBoardId,
  time_min,
});

export const fromExerciseBlockDto = ({
  _id,
  video_url,
  description,
  coaching_points,
  tactics_board,
  time_min,
}: ExerciseBlockDto): ExerciseBlock => ({
  _id,
  video_url,
  description,
  coaching_points,
  tacticBoardId: tactics_board,
  time_min,
});

export const toTacticBoardRequestDto = ({
  name,
  isPrivate,
  tags,
  pages,
  description,
  coaching_points,
}: TacticBoardRequest): TacticBoardRequestDto => ({
  name,
  isPrivate,
  tags,
  pages,
  description,
  coaching_points,
});
