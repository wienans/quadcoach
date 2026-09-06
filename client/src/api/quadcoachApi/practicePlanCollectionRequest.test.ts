import { describe, expect, it } from "vitest";

import { serializePracticePlanCollectionRequest } from "./practicePlanCollectionRequest";

describe("PracticePlan collection request serialization", () => {
  it("serializes only approved semantic collection parameters", () => {
    expect(serializePracticePlanCollectionRequest(undefined)).toBe("");

    expect(
      serializePracticePlanCollectionRequest({
        search: "Press .* [break]",
        tags: ["team A", "fast"],
        tagMode: "all",
        privacy: "public",
        sort: "updated",
        direction: "desc",
        page: 2,
        limit: 25,
      }),
    ).toBe(
      "search=Press+.*+%5Bbreak%5D&tags=team+A&tags=fast&tagMode=all&privacy=public&sort=updated&direction=desc&page=2&limit=25",
    );
  });
});
