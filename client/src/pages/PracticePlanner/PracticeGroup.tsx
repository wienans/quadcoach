import { useTranslation } from "react-i18next";
import { Card, IconButton, Typography, Divider } from "@mui/material";
import "../PracticePlanner/translations";

import { SoftBox, SoftButton, SoftInput } from "../../components";
import ExerciseSearchDialog, {
  ExerciseBlockSelection,
} from "../../components/ExerciseParts/ExerciseSearchDialog";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { useState } from "react";
import { FieldArray, FieldArrayRenderProps, FormikProps } from "formik";
import {
  PracticePlanEntityPartialId,
  PracticePlanGroupPartialId,
  PracticePlanItemPartialId,
} from "../../api/quadcoachApi/domain/PracticePlan";
import PracticeItem from "./PracticeItem";

// Group Component
interface PracticeGroupProps {
  group: PracticePlanGroupPartialId;
  groupIndex: number;
  sectionIndex: number;
  isEditMode: boolean;
  formik: FormikProps<PracticePlanEntityPartialId>;
  onDelete: () => void;
}

const PracticeGroup: React.FC<PracticeGroupProps> = ({
  group,
  groupIndex,
  sectionIndex,
  isEditMode,
  formik,
  onDelete,
}) => {
  const { t } = useTranslation("PracticePlanner");
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);

  // Calculate total duration for the group
  const calculateGroupTotal = () => {
    return (
      group.items?.reduce((total: number, item: PracticePlanItemPartialId) => {
        return total + (item.duration || 0);
      }, 0) || 0
    );
  };

  const groupTotal = calculateGroupTotal();

  const handleAddExercises = (selections: ExerciseBlockSelection[]) => {
    // Create a deep copy to avoid immutability issues
    const sections = JSON.parse(JSON.stringify(formik.values.sections));

    // Ensure the items array exists and is mutable
    if (!sections[sectionIndex].groups[groupIndex].items) {
      sections[sectionIndex].groups[groupIndex].items = [];
    }

    selections.forEach((selection) => {
      selection.blockIds.forEach((blockId) => {
        const newItem: PracticePlanItemPartialId = {
          _id: `temp_${Date.now()}_${Math.random()}`,
          kind: "exercise",
          exerciseId: selection.exerciseId,
          blockId: blockId,
          duration: selection.blockDurations[blockId] || 10,
        };
        sections[sectionIndex].groups[groupIndex].items.push(newItem);
      });
    });

    formik.setFieldValue("sections", sections);
  };

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <SoftBox p={2}>
        {/* Group Header */}
        <SoftBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          {isEditMode ? (
            <SoftInput
              placeholder={t("groupName")}
              value={group.name}
              onChange={(e) => {
                const sections = JSON.parse(
                  JSON.stringify(formik.values.sections),
                );
                sections[sectionIndex].groups[groupIndex].name = e.target.value;
                formik.setFieldValue("sections", sections);
              }}
              size="small"
            />
          ) : (
            <Typography variant="h6" fontWeight="medium">
              {group.name}
            </Typography>
          )}

          <SoftBox display="flex" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {groupTotal}
              {t("minutes")}
            </Typography>
            {isEditMode && (
              <IconButton size="small" color="error" onClick={onDelete}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </SoftBox>
        </SoftBox>

        <Divider sx={{ mb: 2 }} />

        {/* Items */}
        <FieldArray
          name={`sections.${sectionIndex}.groups.${groupIndex}.items`}
          render={(itemArrayHelpers: FieldArrayRenderProps) => (
            <SoftBox>
              {group.items?.map(
                (item: PracticePlanItemPartialId, itemIndex: number) => (
                  <PracticeItem
                    key={item._id || itemIndex}
                    item={item}
                    itemIndex={itemIndex}
                    groupIndex={groupIndex}
                    sectionIndex={sectionIndex}
                    isEditMode={isEditMode}
                    formik={formik}
                    onDelete={() => itemArrayHelpers.remove(itemIndex)}
                    onMoveUp={() => {
                      if (itemIndex > 0) {
                        const sections = JSON.parse(
                          JSON.stringify(formik.values.sections),
                        );
                        const items = [
                          ...sections[sectionIndex].groups[groupIndex].items,
                        ];
                        [items[itemIndex], items[itemIndex - 1]] = [
                          items[itemIndex - 1],
                          items[itemIndex],
                        ];
                        sections[sectionIndex].groups[groupIndex].items = items;
                        formik.setFieldValue("sections", sections);
                      }
                    }}
                    onMoveDown={() => {
                      if (itemIndex < (group.items?.length || 0) - 1) {
                        const sections = JSON.parse(
                          JSON.stringify(formik.values.sections),
                        );
                        const items = [
                          ...sections[sectionIndex].groups[groupIndex].items,
                        ];
                        [items[itemIndex], items[itemIndex + 1]] = [
                          items[itemIndex + 1],
                          items[itemIndex],
                        ];
                        sections[sectionIndex].groups[groupIndex].items = items;
                        formik.setFieldValue("sections", sections);
                      }
                    }}
                    canMoveUp={itemIndex > 0}
                    canMoveDown={itemIndex < (group.items?.length || 0) - 1}
                  />
                ),
              )}

              {/* Add Item Buttons - only in edit mode */}
              {isEditMode && (
                <SoftBox display="flex" gap={1} mt={2}>
                  <SoftButton
                    variant="outlined"
                    size="small"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setIsExerciseDialogOpen(true)}
                  >
                    {t("addExercise")}
                  </SoftButton>
                  <SoftButton
                    variant="outlined"
                    size="small"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      itemArrayHelpers.push({
                        _id: `temp_${Date.now()}_${Math.random()}`,
                        kind: "break",
                        description: "Break",
                        duration: 5,
                      });
                    }}
                  >
                    {t("addBreak")}
                  </SoftButton>
                </SoftBox>
              )}
            </SoftBox>
          )}
        />
      </SoftBox>

      {/* Exercise Search Dialog */}
      <ExerciseSearchDialog
        open={isExerciseDialogOpen}
        onClose={() => setIsExerciseDialogOpen(false)}
        onAddExercises={handleAddExercises}
      />
    </Card>
  );
};

export default PracticeGroup;
