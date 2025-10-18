import "./translations";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Chip,
  CardContent,
  Card,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Exercise, Block } from "../../api/quadcoachApi/domain";
import { lazy, Suspense } from "react";
import UniversalMediaPlayer from "../UniversalMediaPlayer";
import TacticBoardInBlockWrapper from "../../pages/Exercises/Exercise/ViewExercise/ExerciseBlock/TacticBoardInBlock";
const MarkdownRenderer = lazy(() => import("../MarkdownRenderer"));

export type ExerciseOverviewDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  exercise?: Exercise;
  block?: Block;
};

const ExerciseOverviewDialog = ({
  isOpen,
  onClose,
  exercise,
  block,
}: ExerciseOverviewDialogProps): JSX.Element => {
  const { t } = useTranslation("ExerciseOverviewDialog");

  if (!exercise || !block) {
    return <></>;
  }

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{exercise.name}</DialogTitle>
      <DialogContent>
        {block.video_url && (
          <>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {t("video")}
            </Typography>
            <div
              style={{
                width: "100%",
                maxWidth: "clamp(400px, 50%, 960px)",
              }}
            >
              <UniversalMediaPlayer
                url={block.video_url || ""}
                width="100%"
                maintainAspectRatio
                controls
                light
              />
            </div>
          </>
        )}
        {block.tactics_board && (
          <>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {t("tacticboard")}
            </Typography>
            <TacticBoardInBlockWrapper block={block} />
          </>
        )}
        {block.description && (
          <>
            <Typography variant="h5" sx={{ mb: 1, mt: 1 }}>
              {t("description")}
            </Typography>
            <Suspense fallback={<div>Loading...</div>}>
              <MarkdownRenderer>{block.description || ""}</MarkdownRenderer>
            </Suspense>
          </>
        )}
        {block.coaching_points && (
          <>
            <Typography variant="h5" sx={{ mb: 1 }}>
              {t("coachingPoints")}
            </Typography>
            <Suspense fallback={<div>Loading...</div>}>
              <MarkdownRenderer>{block.coaching_points || ""}</MarkdownRenderer>
            </Suspense>
          </>
        )}
        <Card>
          <CardContent>
            <Box>
              <Typography variant="h5" gutterBottom>
                {t("details")}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={`${t("duration")}: ${block.time_min} ${t("minutes")}`}
                  size="small"
                  color="primary"
                />
                <Chip
                  label={`${t("persons")}: ${exercise.persons}`}
                  size="small"
                  color="secondary"
                />
                <Chip
                  label={`${t("beaters")}: ${exercise.beaters}`}
                  size="small"
                  color="info"
                />
                <Chip
                  label={`${t("chasers")}: ${exercise.chasers}`}
                  size="small"
                />
              </Box>
            </Box>

            {exercise.materials && exercise.materials.length > 0 && (
              <Box mb={2}>
                <Typography variant="h6" gutterBottom>
                  {t("materials")}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {exercise.materials.map((material: string, index: number) => (
                    <Chip
                      key={index}
                      label={material}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {exercise.tags && exercise.tags.length > 0 && (
              <Box mb={2}>
                <Typography variant="h6" gutterBottom>
                  {t("tags")}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {exercise.tags.map((tag: string, index: number) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      variant="outlined"
                      color="success"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseOverviewDialog;
