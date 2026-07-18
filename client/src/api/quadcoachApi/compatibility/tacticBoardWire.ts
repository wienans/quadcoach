import type { ResourceAccessLevel } from "../domain";

export type LegacyTacticBoardFavoriteRequest = {
  userId: string;
  tacticboardId: string;
};

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

export type LegacyTacticBoardAccessRequest = {
  tacticboardId: string;
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

export type LegacyTacticBoardAccessDeleteRequest = {
  tacticboardId: string;
  userId: string;
};

export type TacticBoardAccessDeleteRequestDto = {
  userId: string;
};

export const fromLegacyTacticBoardFavoriteRequest = ({
  userId,
  tacticboardId,
}: LegacyTacticBoardFavoriteRequest): TacticBoardFavoriteRequest => ({
  userId,
  tacticBoardId: tacticboardId,
});

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

export const toLegacyTacticBoardFavoriteResponse = ({
  _id,
  user,
  tacticBoardId,
  createdAt,
}: TacticBoardFavorite): TacticBoardFavoriteResponseDto => ({
  _id,
  user,
  tacticboard: tacticBoardId,
  createdAt,
});

export const fromLegacyTacticBoardAccessRequest = ({
  tacticboardId,
  userId,
  access,
}: LegacyTacticBoardAccessRequest): TacticBoardAccessRequest => ({
  tacticBoardId: tacticboardId,
  userId,
  access,
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

export const toLegacyTacticBoardAccessEntryResponse = ({
  user,
  tacticBoardId,
  access,
  createdAt,
}: TacticBoardAccessEntry): TacticBoardAccessEntryResponseDto => ({
  user: { _id: user._id, name: user.name },
  tacticboard: tacticBoardId,
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

export const toLegacyTacticBoardAccessMutationResponse = ({
  userId,
  tacticBoardId,
  access,
  createdAt,
}: TacticBoardAccessMutationResponse): TacticBoardAccessMutationResponseDto => ({
  user: userId,
  tacticboard: tacticBoardId,
  access,
  createdAt,
});

export const fromLegacyTacticBoardAccessDeleteRequest = ({
  tacticboardId,
  userId,
}: LegacyTacticBoardAccessDeleteRequest): TacticBoardAccessDeleteRequest => ({
  tacticBoardId: tacticboardId,
  userId,
});

export const toTacticBoardAccessDeleteRequestDto = ({
  userId,
}: TacticBoardAccessDeleteRequest): TacticBoardAccessDeleteRequestDto => ({
  userId,
});
