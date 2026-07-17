import { describe, expect, it } from "vitest";

import {
  fromExerciseBlockDto,
  fromTacticBoardAccessEntryResponseDto,
  fromTacticBoardFavoriteResponseDto,
  toExerciseBlockDto,
  toTacticBoardAccessRequestDto,
  toTacticBoardFavoriteRequestDto,
  toTacticBoardRequestDto,
} from "./tacticBoardWire";

describe("TacticBoard permanent wire compatibility", () => {
  it("maps Favorite requests and responses to canonical internal names", () => {
    expect(
      toTacticBoardFavoriteRequestDto({
        userId: "user-1",
        tacticBoardId: "board-1",
      }),
    ).toEqual({ userId: "user-1", tacticboardId: "board-1" });

    expect(
      fromTacticBoardFavoriteResponseDto({
        _id: "favorite-1",
        user: "user-1",
        tacticboard: "board-1",
        createdAt: "2026-07-17T10:00:00.000Z",
      }),
    ).toEqual({
      _id: "favorite-1",
      user: "user-1",
      tacticBoardId: "board-1",
      createdAt: "2026-07-17T10:00:00.000Z",
    });
  });

  it("round-trips Access and embedded Exercise references through legacy keys", () => {
    expect(
      toTacticBoardAccessRequestDto({
        tacticBoardId: "board-1",
        userId: "user-2",
        access: "edit",
      }),
    ).toEqual({
      userId: "user-2",
      access: "edit",
    });

    expect(
      fromTacticBoardAccessEntryResponseDto({
        user: { _id: "user-2", name: "Coach" },
        tacticboard: "board-1",
        access: "view",
        createdAt: "2026-07-17T10:00:00.000Z",
      }),
    ).toEqual({
      user: { _id: "user-2", name: "Coach" },
      tacticBoardId: "board-1",
      access: "view",
      createdAt: "2026-07-17T10:00:00.000Z",
    });

    const block = {
      _id: "block-1",
      video_url: "https://example.test/video",
      description: "Run the shape",
      coaching_points: "Keep spacing",
      tacticBoardId: "board-1",
      time_min: 12,
    };

    const dto = toExerciseBlockDto(block);
    expect(dto).toEqual({
      _id: "block-1",
      video_url: "https://example.test/video",
      description: "Run the shape",
      coaching_points: "Keep spacing",
      tactics_board: "board-1",
      time_min: 12,
    });
    expect(fromExerciseBlockDto(dto)).toEqual(block);
  });

  it("allowlists adapters so canonical and forbidden fields cannot leak", () => {
    const favoriteRequest = {
      userId: "user-1",
      tacticBoardId: "board-1",
      tacticBoard: "canonical-must-not-leak",
      _id: "persistence-must-not-leak",
      shareToken: "lifecycle-must-not-leak",
    };
    expect(toTacticBoardFavoriteRequestDto(favoriteRequest)).toEqual({
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

    const boardRequest = {
      name: "Press",
      isPrivate: true,
      tags: ["defence"],
      pages: [],
      description: "Force the sideline",
      coaching_points: "Move together",
      _id: "persistence-must-not-leak",
      creator: "ownership-must-not-leak",
      user: "ownership-must-not-leak",
      shareToken: "lifecycle-must-not-leak",
      createdAt: "persistence-must-not-leak",
      updatedAt: "persistence-must-not-leak",
      __v: 1,
    };
    expect(toTacticBoardRequestDto(boardRequest)).toEqual({
      name: "Press",
      isPrivate: true,
      tags: ["defence"],
      pages: [],
      description: "Force the sideline",
      coaching_points: "Move together",
    });

    const serializedDtos = JSON.stringify({
      favorite: toTacticBoardFavoriteRequestDto(favoriteRequest),
      block: toExerciseBlockDto({
        _id: "block-1",
        tacticBoardId: "board-1",
        time_min: 5,
      }),
    });
    expect(serializedDtos).not.toContain('"tacticBoard"');
    expect(serializedDtos).not.toContain('"tacticBoardId"');
  });
});
