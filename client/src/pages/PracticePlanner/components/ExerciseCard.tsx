import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  OpenInNew as OpenIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";
import { SoftTypography } from "../../../components";
import { SelectedExercise, PracticeGroup } from "../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";

interface ExerciseCardProps {
  exercise: SelectedExercise;
  groupId: string;
  allGroups: PracticeGroup[];
  onRemove: (exerciseId: string, groupId: string) => void;
  onMove: (exerciseId: string, fromGroupId: string, toGroupId: string) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  groupId,
  allGroups,
  onRemove,
  onMove,
}) => {
  const { t } = useTranslation("PracticePlanner");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [moveAnchorEl, setMoveAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMoveMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMoveAnchorEl(event.currentTarget);
    setAnchorEl(null);
  };

  const handleMoveMenuClose = () => {
    setMoveAnchorEl(null);
  };

  const selectedBlocks = exercise.selectedBlocks.filter(block => block.selected);
  const otherGroups = allGroups.filter(group => group.id !== groupId);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent sx={{ py: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <DragIcon sx={{ color: "text.secondary", cursor: "grab" }} />
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <SoftTypography variant="h6" fontWeight="medium">
                  {exercise.exerciseName}
                </SoftTypography>
                <Chip
                  label={`${exercise.totalTime} min`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`${selectedBlocks.length} blocks`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
          <Box>
            <IconButton onClick={handleMenuClick} size="small">
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {otherGroups.length > 0 && (
                <MenuItem onClick={handleMoveMenuClick}>
                  <OpenIcon sx={{ mr: 1 }} fontSize="small" />
                  {t("PracticePlanner:moveToGroup")}
                </MenuItem>
              )}
              <MenuItem 
                onClick={() => {
                  if (window.confirm(t("PracticePlanner:confirmRemoveExercise"))) {
                    onRemove(exercise.exerciseId, groupId);
                  }
                  handleMenuClose();
                }}
                sx={{ color: "error.main" }}
              >
                <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                {t("PracticePlanner:removeFromGroup")}
              </MenuItem>
            </Menu>
            <Menu
              anchorEl={moveAnchorEl}
              open={Boolean(moveAnchorEl)}
              onClose={handleMoveMenuClose}
            >
              {otherGroups.map((group) => (
                <MenuItem
                  key={group.id}
                  onClick={() => {
                    onMove(exercise.exerciseId, groupId, group.id);
                    handleMoveMenuClose();
                  }}
                >
                  {group.name}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

        {selectedBlocks.length > 0 && (
          <Accordion sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2" color="text.secondary">
                {t("PracticePlanner:exerciseBlocks")} ({selectedBlocks.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {selectedBlocks.map((selectedBlock, index) => (
                  <Card
                    key={selectedBlock.blockId}
                    variant="outlined"
                    sx={{ mb: index < selectedBlocks.length - 1 ? 1 : 0 }}
                  >
                    <CardContent sx={{ py: 1.5 }}>
                      <Box display="flex" justifyContent="between" alignItems="center" mb={1}>
                        <Typography variant="subtitle2" fontWeight="medium">
                          Block {index + 1}
                        </Typography>
                        <Chip
                          label={`${selectedBlock.block.time_min} min`}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      {selectedBlock.block.description && (
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          <strong>{t("PracticePlanner:description")}:</strong> {selectedBlock.block.description}
                        </Typography>
                      )}
                      {selectedBlock.block.coaching_points && (
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          <strong>{t("PracticePlanner:coachingPoints")}:</strong> {selectedBlock.block.coaching_points}
                        </Typography>
                      )}
                      {selectedBlock.block.video_url && (
                        <Typography variant="body2" color="primary">
                          <strong>{t("PracticePlanner:videoUrl")}:</strong>{" "}
                          <a href={selectedBlock.block.video_url} target="_blank" rel="noopener noreferrer">
                            {selectedBlock.block.video_url}
                          </a>
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;