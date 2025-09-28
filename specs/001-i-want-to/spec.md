# Feature Specification: Practice Planner

**Feature Branch**: `001-i-want-to`  
**Created**: 2025-09-28  
**Status**: Draft  
**Input**: User description: "I want to add a Practice Planner feature. A Practice Plan is composed from Sections. Each Section of the Practice Plan should be Renamable and Reorderable and i want to be able to add and delete the sections. I want to have 3 Default Sections (Warm Up, Main, Cooldown), these can also be renamed and deleted. For each Section i want to be able to assign a amount of Practice Time, so that i can later compare the summed exercise time with the defined time. Each Section should include Groups of Players. By Default add a Group All Players. The name of the group should be changable and i also want to be able to delete and add groups to each Section. Each section can have different Groups assigned. For each Group of Players i want to Select Exercises. As the Exercises in the database consists of Blocks i want to be able to select Exercise Blocks. The Time of the Multiple Exercise Blocks should add up and be compared to the defined time for the Section. As each group has different time visualize the summed time the group needs in the groups header and compare the maximum time from the groups with the Section and visualize this in the section header. I also want to have the option of breaks between the exercises so there should be a dummy which i can add and rename for a break. The breaks should have a different color and i should be able to add a time for it. I want to be able to move exercises up and down as well as moving sections up and down within the plan. Each Practice Plan should have a Name and optionally Description and Tags"

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
1. Mark ambiguities explicitly (none remain after clarification)
2. Do not guess unstated constraints
3. Think like a tester (all requirements are testable)

## Clarifications
### Session 2025-09-28
- Q: Which users can access and modify Practice Plans? → A: Owner coach plus explicitly shared coaches can edit; others no access
- Q: Should shared coaches have equal rights to delete and duplicate sections/groups as the owner? → A: Yes, full equal edit rights
- Q: Should there be versioning or historical snapshots for Practice Plans (e.g., to review past revisions)? → A: No versioning; only latest state kept
- Q: How should a Group be modeled relative to actual players? → A: Pure label container; no player membership now (player assignment explicitly out-of-scope)
- Q: How should plan saving handle concurrent edits by two authorized coaches? → A: Last save wins silently (no conflict detection)
- Q: How should breaks be counted when calculating a section's max group total? → A: Break durations always included (current assumption)
- Q: What performance expectation applies to recalculating totals after an edit? → A: Immediate (perceived <100ms) recalculation for any change (target)
- Q: What is the maximum expected scale for a single Practice Plan? → A: Up to 10 sections; each ≤5 groups; ≤15 items/group

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
A coach creates and manages a structured practice plan divided into sections. Inside each section the coach arranges abstract player groups and sequences exercise blocks and breaks, sets target durations, compares planned versus target time, and adjusts ordering and naming to finalize a coherent practice outline.

### Acceptance Scenarios
1. **Given** the coach opens a new practice plan, **When** it loads, **Then** it contains three editable/deletable default sections: Warm Up, Main, Cooldown.
2. **Given** the coach views the Side Navigation, **When** looking for planning tools, **Then** a Practice Planner entry is available and opens the planner when selected.
3. **Given** a section has a target duration in minutes, **When** exercise blocks and breaks are added to any group, **Then** the section header shows current max group total / target and turns the time text red only if total exceeds target.
4. **Given** a section target is set to 0 minutes, **When** the section is displayed, **Then** the section is visually grayed to denote zero planned time.
5. **Given** a group contains exercise blocks, **When** the coach overrides a block's default duration with a custom minute value, **Then** the group's total recalculates immediately using the overridden value.
6. **Given** a group list, **When** the coach adds a break with a name and duration, **Then** it appears with distinct styling and its duration counts toward the group's and section's totals.
7. **Given** exercise blocks and breaks in a group, **When** the coach reorders them (move up or down), **Then** the list order updates and totals remain correct.
8. **Given** a section, **When** the coach adds a new group, **Then** a new group with default name (e.g., "Group") and zero total appears ready for block selection.
9. **Given** a group containing exercises, **When** the coach deletes the group and confirms, **Then** the group and its items are removed and section totals update.
10. **Given** a section, **When** the coach duplicates it, **Then** a new section with the same groups (and their items and overridden durations) appears and can be independently edited.
11. **Given** a group, **When** the coach duplicates it within the same section, **Then** a new group with identical items and durations appears.
12. **Given** a plan with multiple sections, **When** the coach reorders sections, **Then** their order updates and persists for the plan.
13. **Given** a plan, **When** the coach deletes all sections (including defaults), **Then** the plan becomes empty and offers an action to add a new section before saving.
14. **Given** an exercise block previously added is later removed from the global exercise catalog, **When** the plan is opened, **Then** a placeholder item labeled (e.g., "Deleted Exercise") shows in its position with zero duration and can be removed.
15. **Given** the coach saves a plan with name, description, and multiple tags, **When** saving succeeds, **Then** all metadata persists (no tag count limit).
16. **Given** the viewport width changes, **When** multiple groups exist in a section, **Then** groups display side-by-side where space allows (commonly 2, up to 3 in a row) and wrap into additional rows or single-column on narrow screens.
17. **Given** a coach is not the owner of a plan and has not been explicitly shared edit rights, **When** attempting to access the plan URL, **Then** access is denied (no read / no edit UI provided).
18. **Given** a shared coach (explicitly added) accesses a plan, **When** performing any edit (delete, duplicate, rename, reorder), **Then** the action succeeds identically to the owner.
19. **Given** a coach edits a plan, **When** saving, **Then** only the latest state is retained (no historical versions accessible).

### Edge Cases
- All three default sections deleted immediately after plan creation (allowed; plan remains valid but empty until a new section is added).
- Plan saved with zero sections (allowed if a name is set).
- Duplicate section names and duplicate group names (allowed; no uniqueness enforcement).
- Target section time = 0 (allowed; triggers gray visual state; still can contain items).
- Exercise block with zero or unspecified (treated as zero) duration (allowed; counts as 0 until overridden).
- Overriding duration to a higher or lower positive integer (minutes) including changing back to zero.
- Negative duration input (rejected with validation message).
- Extremely large duration (no upper bound; rely on practical coach input; still stored and calculated as minutes).
- Break with zero duration (allowed, counts 0) vs negative duration (rejected).
- Deleting a group that has items requires confirmation; group without items may delete without confirmation.
- Many tags applied (no limit) including duplicates (spec does not enforce uniqueness of tags—interpretation left to broader tagging policy).
- Deleted (externally removed) exercise blocks render as placeholder until removed or replaced.
- Attempted access by non-owner, non-shared user (denied without data leakage).
- Shared coach performs destructive action (delete section/group) — treated identically to owner.
- User expects a previous version after changes (not available; only current state retained).

## Requirements *(mandatory)*

### Functional Requirements
(Note: All time units are minutes with 1-minute granularity; all calculations in minutes.)
- **FR-001**: System MUST provide a Practice Planner entry in the Side Navigation to access the feature.
- **FR-002**: System MUST create new practice plans with three default sections: Warm Up, Main, Cooldown.
- **FR-003**: System MUST allow renaming any section (including defaults) with no uniqueness constraint.
- **FR-004**: System MUST allow deleting any section; deleting all sections is allowed.
- **FR-005**: System MUST allow adding a new section at any chosen position.
- **FR-006**: System MUST allow reordering sections (move up/down or drag) and persist the order.
- **FR-007**: System MUST allow setting/editing a non-negative integer target duration (minutes) for each section (0 allowed; blank not allowed).
- **FR-008**: System MUST visually gray a section whose target duration is 0.
- **FR-009**: System MUST initialize each section (including newly added ones) with a default group named "All Players" (name editable, non-unique).
- **FR-010**: System MUST allow adding additional groups to a section (abstract groups; no individual player assignment).
- **FR-011**: System MUST allow renaming any group with no uniqueness constraint.
- **FR-012**: System MUST allow deleting a group; confirmation required only if the group contains at least one exercise block or break.
- **FR-013**: System MUST allow duplication of a section (including all groups, items, overrides, breaks, and ordering) as an independent copy.
- **FR-014**: System MUST allow duplication of a group within the same section (copying items, durations, breaks, overrides).
- **FR-015**: System MUST treat groups as section-scoped (no sharing across sections).
- **FR-016**: System MUST allow selecting exercise blocks for a group from available exercise blocks.
- **FR-017**: System MUST allow overriding the duration of a selected exercise block with a custom non-negative integer minute value (0 allowed).
- **FR-018**: System MUST display each exercise block with its name (or placeholder if deleted) and effective duration (overridden or default, zero if unspecified or deleted).
- **FR-019**: System MUST allow inserting, naming, and assigning a duration to a break item between exercises; break duration is a non-negative integer (0 allowed) and counts toward totals.
- **FR-020**: System MUST visually distinguish breaks from exercise blocks.
- **FR-021**: System MUST include exercise block and break durations in the group's total duration.
- **FR-022**: System MUST calculate each section's comparison using the maximum total duration of its groups.
- **FR-023**: System MUST display section time comparison in the format current_total / target and color the time value red only when current_total > target.
- **FR-024**: System MUST allow reordering of items (exercise blocks and breaks) within a group; group reordering across the section is NOT required.
- **FR-025**: System MUST allow deleting an exercise block or break from a group.
- **FR-026**: System MUST represent deleted/removed external exercise blocks with a placeholder label (e.g., "Deleted Exercise") and zero duration until removed by the coach.
- **FR-027**: System MUST update all affected totals and comparisons immediately after any add, delete, reorder, rename, override, or duplication action.
- **FR-028**: System MUST allow plan metadata: required name, optional description, optional unlimited tags (no tag count limit enforced here).
- **FR-029**: System MUST prevent saving a plan without a non-empty name.
- **FR-030**: System MUST allow saving a plan with zero sections (valid empty structure) if a name is present.
- **FR-031**: System MUST provide an explicit action to discard unsaved changes (no autosave assumed).
- **FR-032**: System MUST reject negative duration inputs with a validation message and not apply them.
- **FR-033**: System MUST persist and restore ordering of sections, ordering of items within groups, overridden durations, breaks, and duplicates.
- **FR-034**: System MUST support large minute totals without imposed upper bound (practical limits only by numeric representation).
- **FR-035**: System MUST adapt group layout responsively: show groups side-by-side where width permits (aiming for 2 common / up to 3 per row) and stack to a single column on narrow screens; additional groups wrap to new rows.
- **FR-036**: System MUST allow sections and groups to share identical names without warning.
- **FR-037**: System SHOULD provide clear labeling or context to differentiate identically named sections or groups (e.g., by order) without enforcing uniqueness.
- **FR-038**: System MUST restrict Practice Plan access so only the owner coach and explicitly shared coaches can view or edit; all others have no access (no read exposure).
- **FR-039**: System MUST grant shared coaches identical edit capabilities to the owner, including duplication and deletion of sections, groups, and items.
- **FR-040**: System MUST retain only the latest saved state of a Practice Plan (no historical version storage or retrieval).
- **FR-041**: System MUST treat simultaneous edits with last-save-wins semantics (no conflict detection or merge UI; later successful save overwrites prior changes).
- **FR-042**: System SHOULD maintain perceived recalculation latency <100ms for totals at stated scale (≤10 sections; each ≤5 groups; ≤15 items/group); outside this scale performance is best-effort.

### Key Entities *(include if feature involves data)*
- **Practice Plan**: Named collection of ordered Sections with optional description and tags; may be empty; stores metadata, structural composition, owner reference, and list of shared coach identities with full edit access. Holds only current state (no version history).
- **Section**: Ordered segment within a Practice Plan with name, target duration (minutes, >=0), zero or more Groups, and derived max group total.
- **Group**: Abstract label-only container within a Section (explicitly no player membership now; player assignment out-of-scope) holding an ordered list of Items (Exercise Blocks or Breaks) and a computed total duration.
- **Exercise Block**: Referenced activity unit with a default duration which may be overridden per group instance; if underlying block deleted externally it persists as placeholder until removed.
- **Break**: Named timed non-exercise interval item with duration (>=0) contributing to totals and visually distinct.
- **Tag**: Free-form label string attached to a Practice Plan (no enforced limit or uniqueness in this scope).
- **Item (Composite Concept)**: Either an Exercise Block instance or Break within a group's ordered list.
- **Sharing (Concept)**: Association of a Practice Plan with additional coach identities granted identical edit permissions to owner.

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (resolved)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---
