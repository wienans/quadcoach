import { useTranslation } from "react-i18next";
import { IconButton, Typography } from "@mui/material";
import "../PracticePlanner/translations";

import { SoftBox, SoftInput, ExerciseOverviewDialog } from "../../components";

import DeleteIcon from "@mui/icons-material/Delete";

import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import TimerIcon from "@mui/icons-material/Timer";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Tooltip from "@mui/material/Tooltip";

import { FormikProps } from "formik";
import { useState } from "react";
import {
  PracticePlanEntityPartialId,
  PracticePlanItemPartialId,
} from "../../api/quadcoachApi/domain/PracticePlan";
import { useGetExerciseQuery } from "../../pages/exerciseApi";

interface PracticeItemProps {
  item: PracticePlanItemPartialId;
  itemIndex: number;
  groupIndex: number;
  sectionIndex: number;
  isEditMode: boolean;
  formik: FormikProps<PracticePlanEntityPartialId>;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const PracticeItem: React.FC<PracticeItemProps> = ({
  item,
  itemIndex,
  groupIndex,
  sectionIndex,
  isEditMode,
  formik,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  const { t } = useTranslation("PracticePlanner");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch exercise data if this is an exercise item
  const { data: exercise } = useGetExerciseQuery(
    item.kind === "exercise" ? item.exerciseId : "",
    {
      skip: item.kind !== "exercise" || !item.exerciseId,
    },
  );

  // Get block number from exercise
  const getBlockNumber = () => {
    if (!exercise || item.kind !== "exercise" || !item.blockId) return "";
    const blockIndex = exercise.description_blocks.findIndex(
      (block) => block._id === item.blockId,
    );
    return blockIndex !== -1 ? (blockIndex + 1).toString() : "";
  };

  // Get the specific block for this exercise item
  const getBlock = () => {
    if (!exercise || item.kind !== "exercise" || !item.blockId) return undefined;
    return exercise.description_blocks.find(
      (block) => block._id === item.blockId,
    );
  };

  const handleExerciseClick = () => {
    if (item.kind === "exercise") {
      setIsDialogOpen(true);
    }
  };

  const updateItem = (field: string, value: string | number) => {
    const sections = JSON.parse(JSON.stringify(formik.values.sections));
    const items = [...sections[sectionIndex].groups[groupIndex].items];

    if (item.kind === "break" && field === "description") {
      items[itemIndex] = {
        ...item,
        description: value as string,
      };
    } else if (item.kind === "exercise") {
      if (field === "exerciseId") {
        items[itemIndex] = {
          ...item,
          exerciseId: value as string,
        };
      } else if (field === "blockId") {
        items[itemIndex] = {
          ...item,
          blockId: value as string,
        };
      }
    }

    if (field === "duration") {
      items[itemIndex] = {
        ...item,
        duration: value as number,
      };
    }

    sections[sectionIndex].groups[groupIndex].items = items;
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

        <Typography
          variant="body2"
          fontWeight="medium"
          flex={1}
          sx={{
            cursor: item.kind === "exercise" ? "pointer" : "default",
            "&:hover":
              item.kind === "exercise"
                ? {
                    textDecoration: "underline",
                    color: "primary.main",
                  }
                : {},
          }}
          onClick={item.kind === "exercise" ? handleExerciseClick : undefined}
        >
          {item.kind === "exercise" ? exercise?.name || t("loading") : t("break")}
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
            <Typography variant="body2">{item.duration}{t("minutes")}</Typography>
          )}

          {isEditMode && (
            <>
              <Tooltip title={t("moveUp")}>
                <span>
                  <IconButton
                    size="small"
                    onClick={onMoveUp}
                    disabled={!canMoveUp}
                  >
                    <ArrowUpwardIcon fontSize="small" />
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
                    <ArrowDownwardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <IconButton size="small" color="error" onClick={onDelete}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </SoftBox>
      </SoftBox>

      {item.kind === "break" && (
        <SoftBox>
          {isEditMode ? (
            <SoftInput
              placeholder={t("breakDescription")}
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
          <Typography variant="body2" color="text.secondary">
            {t("block")} {getBlockNumber()}
          </Typography>
        </SoftBox>
      )}

      <ExerciseOverviewDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        exercise={exercise}
        block={getBlock()}
      />
    </SoftBox>
  );
};

export default PracticeItem;
