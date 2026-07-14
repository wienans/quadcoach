export type ResourceAccessLevel = "view" | "edit";

export type ResourceAuthorizationBasis =
  | "owner"
  | "admin"
  | "granted"
  | "public";

export type ResourceAuthorizationResponse = {
  hasAccess: boolean;
  type: ResourceAuthorizationBasis | null;
  level: ResourceAccessLevel | null;
};

export const canEditResource = (
  authorization: ResourceAuthorizationResponse | undefined,
): boolean => authorization?.level === "edit";

export const canManageResource = (
  authorization: ResourceAuthorizationResponse | undefined,
): boolean =>
  authorization?.type === "owner" || authorization?.type === "admin";
