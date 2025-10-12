import { useTranslation } from "react-i18next";
import { IconButton, Typography } from "@mui/material";

import { SoftBox, SoftInput } from "../../components";

import DeleteIcon from "@mui/icons-material/Delete";

import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import TimerIcon from "@mui/icons-material/Timer";

import { FormikProps } from "formik";
import {
  PracticePlanEntityPartialId,
  PracticePlanItem,
} from "../../api/quadcoachApi/domain/PracticePlan";

interface PracticeItemProps {
  item: PracticePlanItem;
  itemIndex: number;
  groupIndex: number;
  sectionIndex: number;
  isEditMode: boolean;
  formik: FormikProps<PracticePlanEntityPartialId>;
  onDelete: () => void;
}

const PracticeItem: React.FC<PracticeItemProps> = ({
  item,
  itemIndex,
  groupIndex,
  sectionIndex,
  isEditMode,
  formik,
  onDelete,
}) => {
  const { t } = useTranslation("Exercise");

  const updateItem = (field: string, value: string | number) => {
    const sections = [...formik.values.sections];
    sections[sectionIndex].groups[groupIndex].items[itemIndex];
    sections[sectionIndex].groups[groupIndex].items[itemIndex][field] = value;
    formik.setFieldValue("sections", sections);
  };

  return (
    <SoftBox
      mb={2}
      p={2}
      borderRadius="lg"
      bgColor={item.kind === "break" ? "light" : "white"}
      border="1px solid"
      borderColor={item.kind === "break" ? "secondary" : "primary"}
    >
      <SoftBox display="flex" alignItems="center" gap={1} mb={1}>
        {item.kind === "exercise" ? (
          <FitnessCenterIcon color="primary" fontSize="small" />
        ) : (
          <FreeBreakfastIcon color="secondary" fontSize="small" />
        )}

        <Typography variant="body2" fontWeight="medium" flex={1}>
          {item.kind === "exercise" ? "Exercise" : "Break"}
        </Typography>

        <SoftBox display="flex" alignItems="center" gap={1}>
          <TimerIcon fontSize="small" />
          {isEditMode ? (
            <SoftInput
              type="number"
              value={item.duration}
              onChange={(e) =>
                updateItem("duration", parseInt(e.target.value) || 0)
              }
              sx={{ width: 60 }}
              size="small"
            />
          ) : (
            <Typography variant="body2">{item.duration}min</Typography>
          )}

          {isEditMode && (
            <IconButton size="small" color="error" onClick={onDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </SoftBox>
      </SoftBox>

      {item.kind === "break" && (
        <SoftBox>
          {isEditMode ? (
            <SoftInput
              placeholder={t("breakDescription", {
                defaultValue: "Break description",
              })}
              value={item.description}
              onChange={(e) => updateItem("description", e.target.value)}
              size="small"
              fullWidth
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          )}
        </SoftBox>
      )}

      {item.kind === "exercise" && (
        <SoftBox>
          {isEditMode ? (
            <SoftBox display="flex" gap={1}>
              <SoftInput
                placeholder="Exercise ID"
                value={item.exerciseId}
                onChange={(e) => updateItem("exerciseId", e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <SoftInput
                placeholder="Block ID"
                value={item.blockId}
                onChange={(e) => updateItem("blockId", e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
            </SoftBox>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Exercise ID: {item.exerciseId}
            </Typography>
          )}
        </SoftBox>
      )}
    </SoftBox>
  );
};

export default PracticeItem;
