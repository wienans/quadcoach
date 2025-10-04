import { createSlice, PayloadAction, nanoid, createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Domain Types (mirroring server model but adapted for client usage)
export interface PracticePlanItemBreak {
  _id: string;
  kind: "break";
  description: string;
  duration: number;
}

export interface PracticePlanItemExercise {
  _id: string;
  kind: "exercise";
  exerciseId: string;
  duration?: number;
}

export type PracticePlanItem = PracticePlanItemBreak | PracticePlanItemExercise;

export interface PracticePlanGroup {
  _id: string;
  name: string;
  items: PracticePlanItem[];
}

export interface PracticePlanSection {
  _id: string;
  name: string;
  targetDuration: number;
  groups: PracticePlanGroup[];
}

export interface PracticePlanEntity {
  _id: string;
  name: string;
  description?: string;
  tags: string[];
  sections: PracticePlanSection[];
  user: string; // owner id
  createdAt?: string;
  updatedAt?: string;
}

export interface PracticePlanState {
  currentPlan: PracticePlanEntity | null; // persisted copy from server
  draft: PracticePlanEntity | null; // user local edits before save
  loading: boolean;
  error: string | null;
  // For optimistic patch tracking
  pendingSave: boolean;
  lastSaveError: string | null;
}

const initialState: PracticePlanState = {
  currentPlan: null,
  draft: null,
  loading: false,
  error: null,
  pendingSave: false,
  lastSaveError: null,
};

// Helper clone (simple deep clone for small object graph)
function clonePlan(plan: PracticePlanEntity): PracticePlanEntity {
  return JSON.parse(JSON.stringify(plan));
}

const practicePlanSlice = createSlice({
  name: "practicePlan",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    loadPlan(state, action: PayloadAction<PracticePlanEntity>) {
      state.currentPlan = action.payload;
      state.draft = clonePlan(action.payload);
      state.error = null;
      state.loading = false;
    },
    resetDraft(state) {
      if (state.currentPlan) {
        state.draft = clonePlan(state.currentPlan);
      }
    },
    updateDraftName(state, action: PayloadAction<string>) {
      if (state.draft) state.draft.name = action.payload;
    },
    updateDraftDescription(state, action: PayloadAction<string | undefined>) {
      if (state.draft) state.draft.description = action.payload;
    },
    updateDraftTags(state, action: PayloadAction<string[]>) {
      if (state.draft) state.draft.tags = action.payload;
    },
    addSection(state, action: PayloadAction<{ name?: string } | undefined>) {
      if (!state.draft) return;
      const newSection: PracticePlanSection = {
        _id: nanoid(),
        name: action.payload?.name || `Section ${state.draft.sections.length + 1}`,
        targetDuration: 0,
        groups: [],
      };
      state.draft.sections.push(newSection);
    },
    updateSectionMeta(
      state,
      action: PayloadAction<{ sectionId: string; name?: string; targetDuration?: number }>
    ) {
      if (!state.draft) return;
      const s = state.draft.sections.find((x) => x._id === action.payload.sectionId);
      if (!s) return;
      if (action.payload.name !== undefined) s.name = action.payload.name;
      if (action.payload.targetDuration !== undefined)
        s.targetDuration = action.payload.targetDuration;
    },
    deleteSection(state, action: PayloadAction<{ sectionId: string }>) {
      if (!state.draft) return;
      state.draft.sections = state.draft.sections.filter(
        (s) => s._id !== action.payload.sectionId
      );
    },
    duplicateSection(state, action: PayloadAction<{ sectionId: string }>) {
      if (!state.draft) return;
      const idx = state.draft.sections.findIndex((s) => s._id === action.payload.sectionId);
      if (idx === -1) return;
      const copy = clonePlan({ ...state.draft, sections: [state.draft.sections[idx]] }).sections[0];
      copy._id = nanoid();
      copy.groups = copy.groups.map((g) => ({
        ...g,
        _id: nanoid(),
        items: g.items.map((it) => ({ ...it, _id: nanoid() })),
      }));
      state.draft.sections.splice(idx + 1, 0, copy);
    },
    addGroup(
      state,
      action: PayloadAction<{ sectionId: string; name?: string }>
    ) {
      if (!state.draft) return;
      const section = state.draft.sections.find((s) => s._id === action.payload.sectionId);
      if (!section) return;
      const group: PracticePlanGroup = {
        _id: nanoid(),
        name: action.payload.name || "Group",
        items: [],
      };
      section.groups.push(group);
    },
    updateGroupName(
      state,
      action: PayloadAction<{ sectionId: string; groupId: string; name: string }>
    ) {
      if (!state.draft) return;
      const section = state.draft.sections.find((s) => s._id === action.payload.sectionId);
      const group = section?.groups.find((g) => g._id === action.payload.groupId);
      if (group) group.name = action.payload.name;
    },
    deleteGroup(
      state,
      action: PayloadAction<{ sectionId: string; groupId: string }>
    ) {
      if (!state.draft) return;
      const section = state.draft.sections.find((s) => s._id === action.payload.sectionId);
      if (!section) return;
      section.groups = section.groups.filter((g) => g._id !== action.payload.groupId);
    },
    addBreakItem(
      state,
      action: PayloadAction<{ sectionId: string; groupId: string; description: string; duration: number }>
    ) {
      if (!state.draft) return;
      const section = state.draft.sections.find((s) => s._id === action.payload.sectionId);
      const group = section?.groups.find((g) => g._id === action.payload.groupId);
      if (!group) return;
      const item: PracticePlanItemBreak = {
        _id: nanoid(),
        kind: "break",
        description: action.payload.description,
        duration: action.payload.duration,
      };
      group.items.push(item);
    },
    addExerciseItem(
      state,
      action: PayloadAction<{ sectionId: string; groupId: string; exerciseId: string; duration?: number }>
    ) {
      if (!state.draft) return;
      const section = state.draft.sections.find((s) => s._id === action.payload.sectionId);
      const group = section?.groups.find((g) => g._id === action.payload.groupId);
      if (!group) return;
      const item: PracticePlanItemExercise = {
        _id: nanoid(),
        kind: "exercise",
        exerciseId: action.payload.exerciseId,
        duration: action.payload.duration,
      };
      group.items.push(item);
    },
    updateItem(
      state,
      action: PayloadAction<{
        sectionId: string;
        groupId: string;
        itemId: string;
        changes: Partial<PracticePlanItemBreak & PracticePlanItemExercise>;
      }>
    ) {
      if (!state.draft) return;
      const section = state.draft.sections.find((s) => s._id === action.payload.sectionId);
      const group = section?.groups.find((g) => g._id === action.payload.groupId);
      const item = group?.items.find((it) => it._id === action.payload.itemId);
      if (item) Object.assign(item, action.payload.changes);
    },
    deleteItem(
      state,
      action: PayloadAction<{ sectionId: string; groupId: string; itemId: string }>
    ) {
      if (!state.draft) return;
      const section = state.draft.sections.find((s) => s._id === action.payload.sectionId);
      const group = section?.groups.find((g) => g._id === action.payload.groupId);
      if (!group) return;
      group.items = group.items.filter((it) => it._id !== action.payload.itemId);
    },
    // Save success merges draft into current
    applySaveSuccess(state, action: PayloadAction<PracticePlanEntity>) {
      state.currentPlan = action.payload;
      state.draft = clonePlan(action.payload);
      state.pendingSave = false;
      state.lastSaveError = null;
    },
    applySaveStart(state) {
      state.pendingSave = true;
      state.lastSaveError = null;
    },
    applySaveError(state, action: PayloadAction<string>) {
      state.pendingSave = false;
      state.lastSaveError = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  loadPlan,
  resetDraft,
  updateDraftName,
  updateDraftDescription,
  updateDraftTags,
  addSection,
  updateSectionMeta,
  deleteSection,
  duplicateSection,
  addGroup,
  updateGroupName,
  deleteGroup,
  addBreakItem,
  addExerciseItem,
  updateItem,
  deleteItem,
  applySaveSuccess,
  applySaveStart,
  applySaveError,
} = practicePlanSlice.actions;

export const PracticePlanReducer = practicePlanSlice.reducer;

// Basic selectors
const selectDomain = (state: RootState) => state.practicePlan;
export const selectDraft = (state: RootState) => selectDomain(state).draft;
export const selectCurrentPlan = (state: RootState) => selectDomain(state).currentPlan;
export const selectPendingSave = (state: RootState) => selectDomain(state).pendingSave;

// Derived (placeholder — T050 will expand with time calculations)
export const selectSectionById = (sectionId: string) =>
  createSelector(selectDraft, (draft) => draft?.sections.find((s) => s._id === sectionId));

export const selectGroupById = (sectionId: string, groupId: string) =>
  createSelector(selectSectionById(sectionId), (section) =>
    section?.groups.find((g) => g._id === groupId)
  );

// Derived totals & per-group calculations (T050)
export const selectPlanTotals = createSelector(selectDraft, (draft) => {
  if (!draft)
    return {
      totalDuration: 0,
      sectionDurations: {} as Record<string, number>,
      groupDurations: {} as Record<string, number>,
    };
  const sectionDurations: Record<string, number> = {};
  const groupDurations: Record<string, number> = {};
  let total = 0;
  for (const s of draft.sections) {
    let sectionTotal = 0;
    for (const g of s.groups) {
      let groupTotal = 0;
      for (const item of g.items) {
        if (item.kind === "break") groupTotal += item.duration;
        else if (item.kind === "exercise")
          groupTotal += (item as PracticePlanItemExercise).duration || 0;
      }
      groupDurations[g._id] = groupTotal;
      sectionTotal += groupTotal;
    }
    sectionDurations[s._id] = sectionTotal;
    total += sectionTotal;
  }
  return { totalDuration: total, sectionDurations, groupDurations };
});

export const selectSectionOverTarget = createSelector(selectPlanTotals, selectDraft, (totals, draft) => {
  if (!draft) return {} as Record<string, boolean>;
  const over: Record<string, boolean> = {};
  for (const s of draft.sections) {
    over[s._id] = (totals.sectionDurations[s._id] || 0) > s.targetDuration;
  }
  return over;
});

// Optimistic update utilities (T051)
export const selectHasUnsavedChanges = createSelector(
  [selectDraft, selectCurrentPlan],
  (draft, current) => {
    if (!draft || !current) return false;
    return JSON.stringify({ ...draft, updatedAt: undefined }) !== JSON.stringify({ ...current, updatedAt: undefined });
  }
);

export default practicePlanSlice;
