import { useTranslation } from "react-i18next";
import {
  Card,
  IconButton,
  Tooltip,
  Grid,
  Typography,
  Divider,
} from "@mui/material";
import "../PracticePlanner/translations";

import { SoftBox, SoftButton, SoftInput } from "../../components";

import DeleteIcon from "@mui/icons-material/Delete";

import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import TimerIcon from "@mui/icons-material/Timer";

import { FieldArray, FieldArrayRenderProps, FormikProps } from "formik";
import {
  PracticePlanEntityPartialId,
  PracticePlanSectionPartialId,
  PracticePlanGroupPartialId,
  PracticePlanItemPartialId,
} from "../../api/quadcoachApi/domain/PracticePlan";
import PracticeGroup from "./PracticeGroup";

interface PracticeSectionProps {
  section: PracticePlanSectionPartialId;
  sectionIndex: number;
  isEditMode: boolean;
  formik: FormikProps<PracticePlanEntityPartialId>;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const PracticeSection: React.FC<PracticeSectionProps> = ({
  section,
  sectionIndex,
  isEditMode,
  formik,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
}) => {
  const { t } = useTranslation("PracticePlanner");

  // Calculate total duration for the section
  const calculateSectionTotal = () => {
    return (
      section.groups?.reduce(
        (max: number, group: PracticePlanGroupPartialId) => {
          const groupTotal =
            group.items?.reduce(
              (groupSum: number, item: PracticePlanItemPartialId) => {
                return groupSum + (item.duration || 0);
              },
              0,
            ) || 0;
          return Math.max(max, groupTotal);
        },
        0,
      ) || 0
    );
  };

  const sectionTotal = calculateSectionTotal();
  const isOverTarget = sectionTotal > section.targetDuration;

  return (
    <SoftBox mb={4}>
      <Card>
        <SoftBox p={3}>
          {/* Section Header */}
          <SoftBox
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <SoftBox display="flex" alignItems="center" flex={1}>
              {isEditMode ? (
                <SoftInput
                  placeholder={t("sectionName")}
                  value={section.name}
                  onChange={(e) => {
                    const sections = [...formik.values.sections];
                    sections[sectionIndex].name = e.target.value;
                    formik.setFieldValue("sections", sections);
                  }}
                  sx={{ mr: 2, minWidth: 200 }}
                />
              ) : (
                <Typography variant="h5" fontWeight="bold" mr={2}>
                  {section.name}
                </Typography>
              )}

              <SoftBox display="flex" alignItems="center">
                <TimerIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography
                  variant="body2"
                  color={isOverTarget ? "error.main" : "text.secondary"}
                  ml={1}
                >
                  {sectionTotal} {t("minutes")} /
                </Typography>
                {isEditMode ? (
                  <div>
                    <SoftInput
                      type="number"
                      value={section.targetDuration}
                      onChange={(e) => {
                        const sections = [...formik.values.sections];
                        sections[sectionIndex].targetDuration =
                          parseInt(e.target.value) || 0;
                        formik.setFieldValue("sections", sections);
                      }}
                      sx={{ width: 80 }}
                    />
                  </div>
                ) : (
                  <Typography
                    variant="body2"
                    color={isOverTarget ? "error.main" : "text.secondary"}
                  >
                    {section.targetDuration} {t("minutes")}
                  </Typography>
                )}
              </SoftBox>
            </SoftBox>

            {/* Section Actions */}
            {isEditMode && (
              <SoftBox display="flex" gap={1}>
                 <Tooltip title={t("moveUp")}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={onMoveUp}
                      disabled={!canMoveUp}
                    >
                      <ArrowUpwardIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                 <Tooltip title={t("moveDown")}>
                  <span>
                    <IconButton
                      size="small"
                      onClick={onMoveDown}
                      disabled={!canMoveDown}
                    >
                      <ArrowDownwardIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                 <Tooltip title={t("deleteSection")}>
                  <IconButton size="small" color="error" onClick={onDelete}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </SoftBox>
            )}
          </SoftBox>

          <Divider sx={{ mb: 2 }} />

          {/* Groups */}
          <FieldArray
            name={`sections.${sectionIndex}.groups`}
            render={(groupArrayHelpers: FieldArrayRenderProps) => (
              <SoftBox>
                {/* Determine grid columns based on screen size */}
                <Grid container spacing={2}>
                  {section.groups?.map(
                    (group: PracticePlanGroupPartialId, groupIndex: number) => (
                      <Grid
                        item
                        xs={12}
                        sm={section.groups.length > 1 ? 6 : 12}
                        md={
                          section.groups.length > 2
                            ? 4
                            : section.groups.length > 1
                            ? 6
                            : 12
                        }
                        key={group._id || groupIndex}
                      >
                        <PracticeGroup
                          group={group}
                          groupIndex={groupIndex}
                          sectionIndex={sectionIndex}
                          isEditMode={isEditMode}
                          formik={formik}
                          onDelete={() => groupArrayHelpers.remove(groupIndex)}
                        />
                      </Grid>
                    ),
                  )}
                </Grid>

                {/* Add Group Button - only in edit mode */}
                {isEditMode && (
                  <SoftBox display="flex" justifyContent="center" mt={2}>
                    <SoftButton
                      variant="outlined"
                      size="small"
                      color="secondary"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        groupArrayHelpers.push({
                          _id: `temp_${Date.now()}_${Math.random()}`,
                          name: "New Group",
                          items: [],
                        });
                      }}
                    >
                      {t("addGroup")}
                    </SoftButton>
                  </SoftBox>
                )}
              </SoftBox>
            )}
          />
        </SoftBox>
      </Card>
    </SoftBox>
  );
};

export default PracticeSection;
