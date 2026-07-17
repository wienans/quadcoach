export type GetTacticBoardRequest = {
  nameRegex?: string;
  tagRegex?: string;
  tagList?: string[];
  isPrivate?: boolean;
  sortBy?: "name" | "created" | "updated";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export const serializeTacticBoardCollectionRequest = (
  request: GetTacticBoardRequest | undefined,
): string => {
  const {
    nameRegex,
    tagRegex,
    tagList,
    isPrivate,
    sortBy,
    sortOrder,
    page = 1,
    limit = 50,
  } = request || {};
  const urlParams = new URLSearchParams();

  urlParams.append("page", page.toString());
  urlParams.append("limit", limit.toString());

  if (nameRegex != null && nameRegex !== "") {
    urlParams.append("name[regex]", nameRegex);
    urlParams.append("name[options]", "i");
  }
  if (tagList != null && tagList.length > 0) {
    urlParams.append("tags[in]", tagList.join(","));
  }
  if (tagRegex != null && tagRegex !== "") {
    urlParams.append("tags[regex]", tagRegex);
    urlParams.append("tags[options]", "i");
  }
  if (isPrivate !== undefined) {
    urlParams.append("isPrivate[eq]", String(isPrivate));
  }
  if (sortBy != null) {
    urlParams.append("sortBy", sortBy);
  }
  if (sortOrder != null) {
    urlParams.append("sortOrder", sortOrder);
  }

  return urlParams.toString();
};
