export type GetPracticePlanRequest = {
  search?: string;
  tags?: string[];
  tagMode?: "all" | "any";
  privacy?: "public" | "private";
  sort?: "name" | "created" | "updated";
  direction?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export const serializePracticePlanCollectionRequest = (
  request: GetPracticePlanRequest | undefined,
): string => {
  const { search, tags, tagMode, privacy, sort, direction, page, limit } =
    request || {};
  const urlParams = new URLSearchParams();

  if (search) urlParams.append("search", search);
  tags?.forEach((tag) => urlParams.append("tags", tag));
  if (tags?.length && tagMode) urlParams.append("tagMode", tagMode);
  if (privacy) urlParams.append("privacy", privacy);
  if (sort) urlParams.append("sort", sort);
  if (direction) urlParams.append("direction", direction);
  if (page != null) urlParams.append("page", page.toString());
  if (limit != null) urlParams.append("limit", limit.toString());

  return urlParams.toString();
};
