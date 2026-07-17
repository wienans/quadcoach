import mongoose, { Types } from "mongoose";
import {
  fromLegacyExercisePersistence,
  fromLegacyExerciseRequest,
  fromLegacyTacticBoardFavoriteRequest,
  toLegacyExercisePersistence,
  toLegacyExerciseResponse,
  toLegacyTacticBoardAccessPersistence,
  toLegacyTacticBoardFavoritePersistence,
  toLegacyTacticBoardListResponse,
} from "../../compatibility/tacticBoardCompatibility";
import Exercise from "../../models/exercise";
import TacticBoard from "../../models/tacticboard";
import TacticboardAccess from "../../models/tacticboardAccess";
import TacticboardFav from "../../models/tacticboardFav";
import {
  expectExactFields,
  expectForbiddenFields,
} from "../utils/fieldAssertions";

describe("TacticBoard permanent compatibility boundaries", () => {
  it("maps canonical DTO fields to exact legacy request, response, and persistence keys", () => {
    const tacticBoardId = new Types.ObjectId().toString();
    const userId = new Types.ObjectId().toString();
    const favorite = fromLegacyTacticBoardFavoriteRequest({
      userId,
      tacticboardId: tacticBoardId,
    });

    expect(favorite).toEqual({ userId, tacticBoardId });
    expect(toLegacyTacticBoardFavoritePersistence(favorite)).toEqual({
      user: userId,
      tacticboard: tacticBoardId,
    });
    expect(
      toLegacyTacticBoardAccessPersistence({
        userId,
        tacticBoardId,
        access: "edit",
      }),
    ).toEqual({ user: userId, tacticboard: tacticBoardId, access: "edit" });

    const listResponse = toLegacyTacticBoardListResponse({
      tacticBoards: [{ _id: tacticBoardId, name: "Press" }],
      pagination: { total: 1, page: 1, pages: 1 },
    });
    expectExactFields(listResponse, ["tacticboards", "pagination"]);
    expectForbiddenFields(listResponse, ["tacticBoards", "tacticBoard"]);
  });

  it("round-trips the Exercise Block DTO through tactics_board storage", () => {
    const tacticBoardId = new Types.ObjectId().toString();
    const legacyExercise = {
      name: "Break the press",
      persons: 7,
      description_blocks: [
        {
          description: "Start from the sideline",
          tactics_board: tacticBoardId,
          time_min: 5,
        },
      ],
    };

    const requestDto = fromLegacyExerciseRequest(legacyExercise);
    expect(requestDto.descriptionBlocks?.[0]).toEqual({
      description: "Start from the sideline",
      tacticBoardId,
      time_min: 5,
    });
    expectForbiddenFields(requestDto, [
      "description_blocks",
      "descriptionBlocks.tactics_board",
    ]);

    const persisted = toLegacyExercisePersistence(requestDto);
    expect(persisted).toEqual(legacyExercise);
    expectForbiddenFields(persisted, [
      "descriptionBlocks",
      "description_blocks.tacticBoard",
      "description_blocks.tacticBoardId",
    ]);

    const response = toLegacyExerciseResponse(
      fromLegacyExercisePersistence(persisted),
    );
    expect(response).toEqual(legacyExercise);
  });

  it("pins model registrations, refs, physical collections, and index fields", async () => {
    await Promise.all([
      TacticBoard.createCollection(),
      Exercise.createCollection(),
      TacticboardAccess.createCollection(),
      TacticboardFav.createCollection(),
    ]);
    await Promise.all([
      TacticBoard.syncIndexes(),
      TacticboardAccess.syncIndexes(),
      TacticboardFav.syncIndexes(),
    ]);

    expect(TacticBoard.modelName).toBe("tacticboards");
    expect(TacticboardAccess.modelName).toBe("tacticboardAccesses");
    expect(TacticboardFav.modelName).toBe("tacticboardFavs");
    expect(TacticBoard.collection.collectionName).toBe("tacticboards");
    expect(TacticboardAccess.collection.collectionName).toBe(
      "tacticboardaccesses",
    );
    expect(TacticboardFav.collection.collectionName).toBe("tacticboardfavs");

    const blockSchema = Exercise.schema.path("description_blocks").schema;
    expect(blockSchema?.path("tactics_board").options.ref).toBe("tacticboards");
    expect(TacticboardAccess.schema.path("tacticboard").options.ref).toBe(
      "tacticboards",
    );
    expect(TacticboardFav.schema.path("tacticboard").options.ref).toBe(
      "tacticboards",
    );

    expect(TacticBoard.schema.indexes()).toEqual(
      expect.arrayContaining([
        [
          { shareToken: 1 },
          expect.objectContaining({
            unique: true,
            partialFilterExpression: { shareToken: { $type: "string" } },
          }),
        ],
      ]),
    );
    expect(TacticboardAccess.schema.indexes()).toEqual(
      expect.arrayContaining([
        [
          { user: 1, tacticboard: 1 },
          expect.objectContaining({ unique: true }),
        ],
      ]),
    );
    expect(TacticboardFav.schema.indexes()).toEqual(
      expect.arrayContaining([
        [
          { user: 1, tacticboard: 1 },
          expect.objectContaining({ unique: true }),
        ],
      ]),
    );

    const [tacticBoardIndexes, accessIndexes, favoriteIndexes] =
      await Promise.all([
        TacticBoard.collection.indexes(),
        TacticboardAccess.collection.indexes(),
        TacticboardFav.collection.indexes(),
      ]);
    expect(tacticBoardIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: { shareToken: 1 }, unique: true }),
      ]),
    );
    expect(accessIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: { user: 1, tacticboard: 1 },
          unique: true,
        }),
      ]),
    );
    expect(favoriteIndexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: { user: 1, tacticboard: 1 },
          unique: true,
        }),
      ]),
    );

    const physicalCollections = await mongoose.connection.db
      ?.listCollections({}, { nameOnly: true })
      .toArray();
    expect(physicalCollections?.map(({ name }) => name)).toEqual(
      expect.arrayContaining([
        "tacticboards",
        "tacticboardaccesses",
        "tacticboardfavs",
      ]),
    );
    expect(physicalCollections?.map(({ name }) => name)).not.toEqual(
      expect.arrayContaining(["tacticBoards", "tacticBoardAccesses"]),
    );
  });
});
