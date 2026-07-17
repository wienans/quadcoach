import { describe, expect, it } from "vitest";

import { serializeTacticBoardCollectionRequest } from "./tacticBoardCollectionRequest";

describe("TacticBoard collection request serialization", () => {
  it("preserves the exact existing bracket-query contract", () => {
    expect(serializeTacticBoardCollectionRequest(undefined)).toBe(
      "page=1&limit=50",
    );

    expect(
      serializeTacticBoardCollectionRequest({
        nameRegex: "Press break",
        tagRegex: "defence+",
        tagList: ["team A", "fast"],
        isPrivate: false,
        sortBy: "updated",
        sortOrder: "desc",
        page: 2,
        limit: 25,
      }),
    ).toBe(
      "page=2&limit=25&name%5Bregex%5D=Press+break&name%5Boptions%5D=i&tags%5Bin%5D=team+A%2Cfast&tags%5Bregex%5D=defence%2B&tags%5Boptions%5D=i&isPrivate%5Beq%5D=false&sortBy=updated&sortOrder=desc",
    );
  });
});
