# Server Context

The Node/Express/MongoDB backend for QuadCoach. Exposes the REST API under `/api/*`, enforces permissions, and handles auth. This glossary covers backend domain vocabulary — data models, permissions, and auth concepts. Shared entity shapes (Exercise, TacticBoard, PracticePlan, etc.) live in [`../CONTEXT-MAP.md`](../CONTEXT-MAP.md).

## Language

### Permissions & Sharing

**Access**:
A per-user grant letting one specific account view or edit another user's resource. Has a level of `view` or `edit`. The canonical collaboration mechanism for named individuals.
_Avoid_: permission, share (a Share Link is a different thing)

**Share Link**:
A public, read-only URL ("anyone with the link") generated from a `shareToken` on a TacticBoard or PracticePlan. Meant for quick distribution (post it anywhere) and easy revocation. Does not require an account. Exercises do not have Share Links.
_Avoid_: public link, token link

**Private** (`isPrivate`):
A flag on TacticBoard and PracticePlan. When set, the resource is visible only to its owner, users granted Access, and Admins. Exercises have no such flag — the Exercise library is public by design.

**Owner**:
The user a resource belongs to (`user` field). May edit and delete it. The denormalized `creator` name field is display-only.

**Admin**:
A privileged role that can see all Private resources and manage users. Stored case-insensitively in `roles` (code accepts both `"Admin"` and `"admin"`).

### Auth

**User**:
An account. Has an email, hashed password, and a `roles` array (default `["user"]`). Every User is treated as a coach (an authoring user) — there is intentionally no `coach`/`player` role distinction today.

**Verified**:
A User whose email has been confirmed. Verification is required to log in.

**Access Token / Refresh Token**:
The JWT pair backing a session. The short-lived access token carries `{ id, email, name, roles }`; the long-lived refresh token lives in an `httpOnly` cookie.

## Out of scope here

Implementation details (Mongoose schemas, controllers, the hand-rolled query-filter operator regex, the DDoS limiter) are not glossary terms. Shared entity definitions are in [`../CONTEXT-MAP.md`](../CONTEXT-MAP.md).
