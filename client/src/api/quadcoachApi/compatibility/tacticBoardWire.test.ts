import { describe, expect, it } from "vitest";

import {
  fromTacticBoardAccessEntryResponseDto,
  fromTacticBoardFavoriteResponseDto,
  fromTacticBoardCollectionResponseDto,
  fromExerciseResponseDto,
  toExerciseRequestDto,
  toTacticBoardAccessRequestDto,
  toTacticBoardFavoriteRequestDto,
} from "./tacticBoardWire";

describe("TacticBoard permanent wire compatibility", () => {
  it("maps Favorite requests and responses to canonical internal names", () => {
    const request = {
      userId: "user-1",
      tacticBoardId: "board-1",
    };
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
  });

  it("maps Access requests and responses at the wire boundary", () => {
    const accessRequest = {
      tacticBoardId: "board-1",
      userId: "user-2",
      access: "edit" as const,
    };
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
  });

  it("allowlists adapters so canonical and forbidden fields cannot leak", () => {
    const favoriteRequest = {
      userId: "user-1",
      tacticBoardId: "board-1",
    };
    const favoriteWithForbiddenFields = {
      ...favoriteRequest,
      tacticBoard: "canonical-must-not-leak",
      _id: "persistence-must-not-leak",
      shareToken: "lifecycle-must-not-leak",
    };
    expect(
      toTacticBoardFavoriteRequestDto(favoriteWithForbiddenFields),
    ).toEqual({
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

  it("maps the permanent collection key to the canonical cache field", () => {
    expect(
      fromTacticBoardCollectionResponseDto({
        tacticboards: [{ _id: "board-1" }],
        pagination: { page: 1, limit: 25, total: 1, pages: 1 },
      }),
    ).toEqual({
      tacticBoards: [{ _id: "board-1" }],
      pagination: { page: 1, limit: 25, total: 1, pages: 1 },
    });
  });

  it("maps embedded Tactic Board IDs at the Exercise wire boundary", () => {
    const response = {
      _id: "exercise-1",
      name: "Break the press",
      persons: 7,
      beaters: 2,
      chasers: 4,
      time_min: 5,
      description_blocks: [
        {
          _id: "block-1",
          description: "Start from the sideline",
          tactics_board: "board-1",
          time_min: 5,
        },
      ],
    };

    const exercise = fromExerciseResponseDto(response);
    expect(exercise.description_blocks[0].tacticBoardId).toBe("board-1");
    expect(exercise.description_blocks[0]).not.toHaveProperty("tactics_board");
    expect(toExerciseRequestDto(exercise)).toEqual(response);
  });
});
