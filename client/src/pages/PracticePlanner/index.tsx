import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks/useAppDispatch";
import { useAppSelector } from "../../store/hooks/useAppSelector";
import {
  useGetPracticePlanQuery,
  usePatchPracticePlanMutation,
} from "../../api/quadcoachApi/practicePlansApi";
import {
  loadPlan,
  selectDraft,
  updateDraftName,
  updateDraftDescription,
  addSection,
  PracticePlanSection,
  updateSectionMeta,
  addGroup,
  PracticePlanGroup,
  addBreakItem,
  addExerciseItem,
  updateItem,
  deleteItem,
  applySaveStart,
  applySaveSuccess,
  applySaveError,
  selectPendingSave,
  selectPlanTotals,
  stripTempIds,
  PracticePlanItem,
  PracticePlanItemBreak,
  PracticePlanItemExercise,
} from "../../store/practicePlan/practicePlanSlice";
import SectionEditor from "../../components/PracticePlanner/SectionEditor/SectionEditor";
import GroupEditor from "../../components/PracticePlanner/GroupEditor/GroupEditor";
import ItemList from "../../components/PracticePlanner/ItemList/ItemList";
import TimeSummary from "../../components/PracticePlanner/TimeSummary/TimeSummary";

const PracticePlannerPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectDraft);
  const pendingSave = useAppSelector(selectPendingSave);
  const totals = useAppSelector(selectPlanTotals);
  const { data, isLoading, isSuccess } = useGetPracticePlanQuery(planId || "", {
    skip: !planId,
  });
  const [patchPlan] = usePatchPracticePlanMutation();

  useEffect(() => {
    if (data) {
      dispatch(loadPlan(data));
    }
  }, [data, dispatch]);

  const handleSave = async () => {
    if (!draft) return;
    dispatch(applySaveStart());
    try {
      const updated = await patchPlan({
        id: draft._id,
        name: draft.name,
        description: draft.description,
        tags: draft.tags,
        sections: stripTempIds(draft.sections),
      }).unwrap();
      dispatch(applySaveSuccess(updated));
    } catch (e: any) {
      dispatch(applySaveError(e?.data?.message || "Save failed"));
    }
  };

  if (!planId) return <div>No plan id provided</div>;
  if (isLoading || (isSuccess && !draft)) return <div>Loading...</div>;
  if (!draft) return <div>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h1>Practice Planner</h1>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          aria-label="plan-name"
          value={draft.name}
          onChange={(e) => dispatch(updateDraftName(e.target.value))}
        />
        <input
          aria-label="plan-description"
          placeholder="Description"
          value={draft.description || ""}
          onChange={(e) => dispatch(updateDraftDescription(e.target.value))}
        />
        <button disabled={pendingSave} onClick={handleSave}>
          {pendingSave ? "Saving..." : "Save"}
        </button>
      </div>
      <TimeSummary />
      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {draft.sections.map((section: PracticePlanSection) => (
          <SectionEditor
            key={section._id}
            section={section}
            onChangeName={(name) =>
              dispatch(updateSectionMeta({ sectionId: section._id, name }))
            }
            onChangeTarget={(minutes) =>
              dispatch(
                updateSectionMeta({
                  sectionId: section._id,
                  targetDuration: minutes,
                }),
              )
            }
          >
            {section.groups.map((g: PracticePlanGroup) => (
              <GroupEditor
                key={g._id}
                group={g}
                onChangeName={(name) =>
                  dispatch({
                    type: "practicePlan/updateGroupName",
                    payload: { sectionId: section._id, groupId: g._id, name },
                  })
                }
              >
                <ItemList
                  items={g.items}
                  onUpdateItem={(itemId, changes: Partial<PracticePlanItem>) =>
                    dispatch(
                      updateItem({
                        sectionId: section._id,
                        groupId: g._id,
                        itemId,
                        changes: changes as Partial<
                          PracticePlanItemBreak & PracticePlanItemExercise
                        >,
                      }),
                    )
                  }
                  onDeleteItem={(itemId) =>
                    dispatch(
                      deleteItem({
                        sectionId: section._id,
                        groupId: g._id,
                        itemId,
                      }),
                    )
                  }
                />
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  <button
                    onClick={() =>
                      dispatch(
                        addBreakItem({
                          sectionId: section._id,
                          groupId: g._id,
                          description: "Break",
                          duration: 5,
                        }),
                      )
                    }
                  >
                    + Break
                  </button>
                  <button
                    onClick={() =>
                      dispatch(
                        addExerciseItem({
                          sectionId: section._id,
                          groupId: g._id,
                          exerciseId: "651ad4e54a9a17037c01f6cf",
                          blockId: "65256232c4046e7919d23b2c",
                          duration: 10,
                        }),
                      )
                    }
                  >
                    + Exercise
                  </button>
                </div>
              </GroupEditor>
            ))}
            <button
              onClick={() => dispatch(addGroup({ sectionId: section._id }))}
            >
              + Group
            </button>
          </SectionEditor>
        ))}
        <button onClick={() => dispatch(addSection(undefined))}>
          + Section
        </button>
      </div>
      <pre
        style={{
          marginTop: 32,
          background: "#272822",
          color: "#f8f8f2",
          padding: 8,
        }}
      >
        {JSON.stringify(totals, null, 2)}
      </pre>
    </div>
  );
};

export default PracticePlannerPage;
