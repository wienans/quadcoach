// Shared integration test context utilities
// Provides access header and global IDs set by earlier tests.

declare global {
  // eslint-disable-next-line no-var
  var __INT_ACCESS_TOKEN__: string | undefined;
  // eslint-disable-next-line no-var
  var __INT_USER_EMAIL__: string | undefined;
  // eslint-disable-next-line no-var
  var __INT_PLAN_ID__: string | undefined;
}

export function authHeader() {
  if (!global.__INT_ACCESS_TOKEN__) {
    throw new Error(
      "Access token not initialized. Ensure login test ran first."
    );
  }
  return { Authorization: `Bearer ${global.__INT_ACCESS_TOKEN__}` };
}

export function storePlanId(id: string) {
  global.__INT_PLAN_ID__ = id;
}

export function requirePlanId(): string {
  if (!global.__INT_PLAN_ID__) throw new Error("Plan id not set yet");
  return global.__INT_PLAN_ID__;
}

export function getDefaultSections() {
  return [
    {
      name: "Warm Up",
      targetDuration: 0,
      groups: [{ name: "All Players", items: [] }],
    },
    {
      name: "Main",
      targetDuration: 0,
      groups: [{ name: "All Players", items: [] }],
    },
    {
      name: "Cooldown",
      targetDuration: 0,
      groups: [{ name: "All Players", items: [] }],
    },
  ];
}
