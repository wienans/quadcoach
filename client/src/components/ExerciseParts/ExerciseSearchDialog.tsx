import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Grid,
} from "@mui/material";
import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Exercise, Block } from "../../api/quadcoachApi/domain";
import ExerciseAutocomplete from "./ExerciseAutocomplete";
import UniversalMediaPlayer from "../UniversalMediaPlayer";
import TacticBoardInBlockWrapper from "../../pages/Exercises/Exercise/ViewExercise/ExerciseBlock/TacticBoardInBlock";
const MarkdownRenderer = lazy(() => import("../MarkdownRenderer"));

export interface ExerciseBlockSelection {
  exerciseId: string;
  exerciseName: string;
  blockIds: string[];
}

interface ExerciseSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onAddExercises: (selections: ExerciseBlockSelection[]) => void;
}

const ExerciseSearchDialog: React.FC<ExerciseSearchDialogProps> = ({
  open,
  onClose,
  onAddExercises,
}) => {
  const { t } = useTranslation("Exercise");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [selectedBlocks, setSelectedBlocks] = useState<
    Record<string, string[]>
  >({});
  const [selectedBlock, setSelectedBlock] = useState<{
    exercise: Exercise;
    block: Block;
  } | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleExerciseSelectionChange = (exercises: Exercise[]) => {
    setSelectedExercises(exercises);

    // Reset block selections when exercises change
    const newSelectedBlocks: Record<string, string[]> = {};
    exercises.forEach((exercise) => {
      // Keep existing block selections for exercises that remain selected
      if (selectedBlocks[exercise._id]) {
        newSelectedBlocks[exercise._id] = selectedBlocks[exercise._id];
      } else {
        // Default to selecting all blocks for newly selected exercises
        newSelectedBlocks[exercise._id] = exercise.description_blocks.map(
          (block) => block._id,
        );
      }
    });
    setSelectedBlocks(newSelectedBlocks);
  };

  const handleBlockToggle = (exerciseId: string, blockId: string) => {
    setSelectedBlocks((prev) => {
      const currentBlocks = prev[exerciseId] || [];
      const newBlocks = currentBlocks.includes(blockId)
        ? currentBlocks.filter((id) => id !== blockId)
        : [...currentBlocks, blockId];

      return {
        ...prev,
        [exerciseId]: newBlocks,
      };
    });
  };

  const handleSelectAllBlocks = (exerciseId: string, selectAll: boolean) => {
    const exercise = selectedExercises.find((ex) => ex._id === exerciseId);
    if (!exercise) return;

    setSelectedBlocks((prev) => ({
      ...prev,
      [exerciseId]: selectAll
        ? exercise.description_blocks.map((block) => block._id)
        : [],
    }));
  };

  const handleBlockClick = (exercise: Exercise, block: Block) => {
    setSelectedBlock({ exercise, block });
  };

  const handleAddExercises = async () => {
    setIsAdding(true);

    const selections: ExerciseBlockSelection[] = selectedExercises
      .filter((exercise) => selectedBlocks[exercise._id]?.length > 0)
      .map((exercise) => ({
        exerciseId: exercise._id,
        exerciseName: exercise.name,
        blockIds: selectedBlocks[exercise._id] || [],
      }));

    onAddExercises(selections);
    setIsAdding(false);
    handleClose();
  };

  const handleClose = () => {
    setSelectedExercises([]);
    setSelectedBlocks({});
    setSelectedBlock(null);
    onClose();
  };

  const isAddDisabled =
    selectedExercises.length === 0 ||
    selectedExercises.every(
      (exercise) => !selectedBlocks[exercise._id]?.length,
    );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {t("addExercises", { defaultValue: "Add Exercises" })}
      </DialogTitle>

      <DialogContent sx={{ height: "70vh", minHeight: 500 }}>
        <Grid container spacing={2} sx={{ height: "100%" }}>
          {/* Left Side - Exercise Search and Selection */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t("searchAndSelectExercises", {
                  defaultValue:
                    "Search and select exercises to add to your practice plan.",
                })}
              </Typography>

              <ExerciseAutocomplete
                selectedExercises={selectedExercises}
                onExercisesSelectedChange={handleExerciseSelectionChange}
                alreadyAddedExercises={[]}
              />
            </Box>

            <Box sx={{ flex: 1, overflow: "auto", pr: 1 }}>
              {selectedExercises.map((exercise) => {
                const exerciseBlockIds = selectedBlocks[exercise._id] || [];
                const allBlockIds = exercise.description_blocks.map(
                  (block) => block._id,
                );
                const allSelected =
                  allBlockIds.length > 0 &&
                  allBlockIds.every((id) => exerciseBlockIds.includes(id));

                return (
                  <Box key={exercise._id} sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {exercise.name}
                    </Typography>

                    {exercise.description_blocks.length > 0 && (
                      <Box sx={{ mb: 1, pl: 2 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={allSelected}
                              indeterminate={
                                !allSelected && exerciseBlockIds.length > 0
                              }
                              onChange={(e) =>
                                handleSelectAllBlocks(
                                  exercise._id,
                                  e.target.checked,
                                )
                              }
                            />
                          }
                          label={t("selectAllBlocks", {
                            defaultValue: "Select all blocks",
                          })}
                        />
                      </Box>
                    )}

                    {exercise.description_blocks.map((block, index) => {
                      const isSelected = exerciseBlockIds.includes(block._id);
                      const isCurrentlySelected =
                        selectedBlock?.block._id === block._id;

                      return (
                        <Card
                          key={block._id}
                          sx={{
                            mb: 1,
                            cursor: "pointer",
                            border: isCurrentlySelected ? 2 : 1,
                            borderColor: isCurrentlySelected
                              ? "primary.main"
                              : "grey.300",
                            "&:hover": {
                              borderColor: "primary.light",
                            },
                          }}
                          onClick={() => handleBlockClick(exercise, block)}
                        >
                          <CardContent
                            sx={{ pb: 1, "&:last-child": { pb: 1 } }}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Box flex={1}>
                                <Typography variant="subtitle2">
                                  {t("block", { defaultValue: "Block" })}{" "}
                                  {index + 1}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {block.time_min}{" "}
                                  {t("minutes", { defaultValue: "minutes" })}
                                </Typography>
                              </Box>
                              <Checkbox
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleBlockToggle(exercise._id, block._id);
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {exercise.description_blocks.length === 0 && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {t("noBlocksAvailable", {
                          defaultValue: "No blocks available for this exercise",
                        })}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Grid>

          {/* Right Side - Block Details */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Box
              sx={{
                height: "100%",
                border: 1,
                borderColor: "grey.300",
                borderRadius: 1,
                p: 2,
                overflow: "auto",
              }}
            >
              {selectedBlock ? (
                <Box>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    {selectedBlock.exercise.name}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {t("duration", { defaultValue: "Duration" })}:{" "}
                    {selectedBlock.block.time_min}{" "}
                    {t("minutes", { defaultValue: "minutes" })}
                  </Typography>
                  {selectedBlock.block.video_url && (
                    <>
                      <Typography variant="h5" sx={{ mb: 1 }}>
                        {t("video", { defaultValue: "Video" })}
                      </Typography>
                      <div
                        style={{
                          width: "100%",
                          maxWidth: "clamp(400px, 50%, 960px)",
                        }}
                      >
                        <UniversalMediaPlayer
                          url={selectedBlock.block.video_url || ""}
                          width="100%"
                          maintainAspectRatio
                          controls
                          light
                        />
                      </div>
                    </>
                  )}
                  {selectedBlock.block.tactics_board && (
                    <>
                      <Typography variant="h5" sx={{ mb: 1 }}>
                        {t("tacticboard", { defaultValue: "Tactic Board" })}
                      </Typography>
                      <TacticBoardInBlockWrapper block={selectedBlock.block} />
                    </>
                  )}
                  {selectedBlock.block.description && (
                    <>
                      <Typography variant="h5" sx={{ mb: 1, mt: 1 }}>
                        {t("description", { defaultValue: "Description" })}
                      </Typography>
                      <Suspense fallback={<div>Loading...</div>}>
                        <MarkdownRenderer>
                          {selectedBlock.block.description || ""}
                        </MarkdownRenderer>
                      </Suspense>
                    </>
                  )}
                  {selectedBlock.block.coaching_points && (
                    <>
                      <Typography variant="h5" sx={{ mb: 1 }}>
                        {t("coachingPoints", {
                          defaultValue: "Coaching Points",
                        })}
                      </Typography>
                      <Suspense fallback={<div>Loading...</div>}>
                        <MarkdownRenderer>
                          {selectedBlock.block.coaching_points || ""}
                        </MarkdownRenderer>
                      </Suspense>
                    </>
                  )}
                </Box>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                  color="text.secondary"
                >
                  <Typography variant="body1" textAlign="center">
                    {t("selectBlockToViewDetails", {
                      defaultValue:
                        "Select a block on the left to view its details here",
                    })}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isAdding}>
          {t("cancel", { defaultValue: "Cancel" })}
        </Button>
        <Button
          onClick={handleAddExercises}
          variant="contained"
          disabled={isAddDisabled || isAdding}
          startIcon={isAdding ? <CircularProgress size={16} /> : undefined}
        >
          {t("addSelected", { defaultValue: "Add Selected" })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExerciseSearchDialog;
