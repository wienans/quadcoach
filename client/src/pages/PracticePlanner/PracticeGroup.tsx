import { useTranslation } from "react-i18next";
import { Card, IconButton, Typography, Divider } from "@mui/material";

import { SoftBox, SoftButton, SoftInput } from "../../components";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { FieldArray, FieldArrayRenderProps, FormikProps } from "formik";
import {
  PracticePlanEntityPartialId,
  PracticePlanItem,
  PracticePlanGroup,
} from "../../api/quadcoachApi/domain/PracticePlan";
import PracticeItem from "./PracticeItem";

// Group Component
interface PracticeGroupProps {
  group: PracticePlanGroup;
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
  const { t } = useTranslation("Exercise");

  // Calculate total duration for the group
  const calculateGroupTotal = () => {
    return (
      group.items?.reduce((total: number, item: PracticePlanItem) => {
        return total + (item.duration || 0);
      }, 0) || 0
    );
  };

  const groupTotal = calculateGroupTotal();

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
              placeholder={t("groupName", { defaultValue: "Group Name" })}
              value={group.name}
              onChange={(e) => {
                const sections = [...formik.values.sections];
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
              {groupTotal}min
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
              {group.items?.map((item: PracticePlanItem, itemIndex: number) => (
                <PracticeItem
                  key={item._id || itemIndex}
                  item={item}
                  itemIndex={itemIndex}
                  groupIndex={groupIndex}
                  sectionIndex={sectionIndex}
                  isEditMode={isEditMode}
                  formik={formik}
                  onDelete={() => itemArrayHelpers.remove(itemIndex)}
                />
              ))}

              {/* Add Item Buttons - only in edit mode */}
              {isEditMode && (
                <SoftBox display="flex" gap={1} mt={2}>
                  <SoftButton
                    variant="outlined"
                    size="small"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      itemArrayHelpers.push({
                        _id: `temp_${Date.now()}_${Math.random()}`,
                        kind: "exercise",
                        exerciseId: "",
                        blockId: "",
                        duration: 10,
                      });
                    }}
                  >
                    {t("addExercise", { defaultValue: "Add Exercise" })}
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
                    {t("addBreak", { defaultValue: "Add Break" })}
                  </SoftButton>
                </SoftBox>
              )}
            </SoftBox>
          )}
        />
      </SoftBox>
    </Card>
  );
};

export default PracticeGroup;
