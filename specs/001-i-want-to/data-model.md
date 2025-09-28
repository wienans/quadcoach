# Data Model: Practice Planner (Phase 1)

## Entities

### PracticePlan

Fields:

- \_id: ObjectId
- name: string (required, non-empty)
- description: string | undefined
- tags: string[] (optional, duplicates allowed)
- sections: Section[] (ordered)
- user: ObjectId (ref User)
- createdAt: Date
- updatedAt: Date

Validation:

- name.trim().length > 0
- sections array may be empty

### Section

Embedded in PracticePlan.sections
Fields:

- id: UUID (client-generated) or ObjectId (server generates) - choose UUID v4 client-side for optimistic operations
- name: string (default Warm Up, Main, Cooldown or "Section")
- targetDuration: number (int >=0)
- groups: Group[] (ordered)

### Group

Embedded in Section.groups
Fields:

- id: UUID
- name: string (default "All Players" for first group or "Group")
- items: Item[] (ordered)

### Item (Discriminated Union)

Common fields:

- id: UUID
- kind: 'exercise' | 'break'
- durationOverride: number (int >=0) optional (exercise only)

Exercise Item specific:

- kind: 'exercise'
- exerciseId: ObjectId (ref Exercise)

Break Item specific:

- kind: 'break'
- name: string (break label, editable)
- duration: number (int >=0)

### Derived (Not Persisted)

- groupTotal = sum( effectiveDuration(item) )
- sectionCurrent = max(groupTotals)
- effectiveDuration(exercise) = durationOverride ?? exercise.defaultDuration ?? 0

## Relationships

- PracticePlan:User (owner) many-to-one
- PracticePlanAccess:User many-to-one (per access record)
- Exercise referenced by exercise items (optional presence)

## State Transitions

Create → Update (mutations to embedded arrays) → Delete.
No archival or version states.

## Indexes

- user (for listing)
- (user, practicePlan) unique compound index in PracticePlanAccess

## Rationale

Embedding chosen for atomic updates and small bounded collection sizes.

### PracticePlanAccess

Separate collection modeling access rights.
Fields:

- \_id: ObjectId
- user: ObjectId (ref users, required)
- practicePlan: ObjectId (ref practicePlans, required)
- access: 'view' | 'edit' (required; MVP: only 'edit' issued)
- createdAt: Date default now

Indexes:

- Unique compound (user, practicePlan)
- practicePlan (for listing collaborators)
- user (for listing accessible plans)

## Open Decisions (Deferred)

- Whether to enforce hard limits on counts (client enforces soft only)
- Server-side schema for validating maximum counts (not required now)
- Potential escalation of access roles beyond view/edit (e.g., owner transfer)
