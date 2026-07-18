import { describe, expect, it } from "vitest";

import {
  fromLegacyTacticBoardAccessRequest,
  fromLegacyTacticBoardFavoriteRequest,
  fromTacticBoardAccessEntryResponseDto,
  fromTacticBoardFavoriteResponseDto,
  toLegacyTacticBoardAccessEntryResponse,
  toLegacyTacticBoardFavoriteResponse,
  toTacticBoardAccessRequestDto,
  toTacticBoardFavoriteRequestDto,
} from "./tacticBoardWire";

describe("TacticBoard permanent wire compatibility", () => {
  it("maps Favorite requests and responses to canonical internal names", () => {
    const request = fromLegacyTacticBoardFavoriteRequest({
      userId: "user-1",
      tacticboardId: "board-1",
    });
    expect(request).toEqual({ userId: "user-1", tacticBoardId: "board-1" });
    expect(toTacticBoardFavoriteRequestDto(request)).toEqual({
      userId: "user-1",
      tacticboardId: "board-1",
    });

    const response = {
      _id: "favorite-1",
      user: "user-1",
      tacticboard: "board-1",
      createdAt: "2026-07-17T10:00:00.000Z",
    };
    const canonical = fromTacticBoardFavoriteResponseDto(response);
    expect(canonical).toEqual({
      _id: "favorite-1",
      user: "user-1",
      tacticBoardId: "board-1",
      createdAt: "2026-07-17T10:00:00.000Z",
    });
    expect(toLegacyTacticBoardFavoriteResponse(canonical)).toEqual(response);
  });

  it("round-trips Access through legacy request and response keys", () => {
    const accessRequest = fromLegacyTacticBoardAccessRequest({
      tacticboardId: "board-1",
      userId: "user-2",
      access: "edit",
    });
    expect(accessRequest.tacticBoardId).toBe("board-1");
    expect(toTacticBoardAccessRequestDto(accessRequest)).toEqual({
      userId: "user-2",
      access: "edit",
    });

    const response = {
      user: { _id: "user-2", name: "Coach" },
      tacticboard: "board-1",
      access: "view" as const,
      createdAt: "2026-07-17T10:00:00.000Z",
    };
    const canonical = fromTacticBoardAccessEntryResponseDto(response);
    expect(canonical).toEqual({
      user: { _id: "user-2", name: "Coach" },
      tacticBoardId: "board-1",
      access: "view",
      createdAt: "2026-07-17T10:00:00.000Z",
    });
    expect(toLegacyTacticBoardAccessEntryResponse(canonical)).toEqual(response);
  });

  it("allowlists adapters so canonical and forbidden fields cannot leak", () => {
    const favoriteRequest = fromLegacyTacticBoardFavoriteRequest({
      userId: "user-1",
      tacticboardId: "board-1",
    });
    const favoriteWithForbiddenFields = {
      ...favoriteRequest,
      tacticBoard: "canonical-must-not-leak",
      _id: "persistence-must-not-leak",
      shareToken: "lifecycle-must-not-leak",
    };
    expect(toTacticBoardFavoriteRequestDto(favoriteWithForbiddenFields)).toEqual({
      userId: "user-1",
      tacticboardId: "board-1",
    });

    const accessDto = {
      user: {
        _id: "user-2",
        name: "Coach",
        email: "private@example.test",
        password: "secret",
      },
      tacticboard: "board-1",
      access: "edit" as const,
      createdAt: "2026-07-17T10:00:00.000Z",
      tacticBoard: "canonical-must-not-leak",
      shareToken: "lifecycle-must-not-leak",
      __v: 1,
    };
    expect(fromTacticBoardAccessEntryResponseDto(accessDto)).toEqual({
      user: { _id: "user-2", name: "Coach" },
      tacticBoardId: "board-1",
      access: "edit",
      createdAt: "2026-07-17T10:00:00.000Z",
    });

    const serializedDtos = JSON.stringify(
      toTacticBoardFavoriteRequestDto(favoriteWithForbiddenFields),
    );
    expect(serializedDtos).not.toContain('"tacticBoard"');
    expect(serializedDtos).not.toContain('"tacticBoardId"');
  });
});
