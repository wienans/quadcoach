import React from "react";
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  Divider,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";
import { SoftButton, SoftTypography } from "../../../components";
import { PracticeGroup } from "../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";
import ExerciseCard from "./ExerciseCard";

interface PracticeGroupComponentProps {
  group: PracticeGroup;
  allGroups: PracticeGroup[];
  onAddExercise: () => void;
  onRemoveExercise: (exerciseId: string, groupId: string) => void;
  onMoveExercise: (exerciseId: string, fromGroupId: string, toGroupId: string) => void;
  onRemoveGroup: (groupId: string) => void;
  onRenameGroup: (groupId: string, newName: string) => void;
}

const PracticeGroupComponent: React.FC<PracticeGroupComponentProps> = ({
  group,
  allGroups,
  onAddExercise,
  onRemoveExercise,
  onMoveExercise,
  onRemoveGroup,
  onRenameGroup,
}) => {
  const { t } = useTranslation("PracticePlanner");
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(group.name);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRename = () => {
    setIsEditing(true);
    setEditName(group.name);
    handleMenuClose();
  };

  const handleSaveRename = () => {
    if (editName.trim()) {
      onRenameGroup(group.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelRename = () => {
    setEditName(group.name);
    setIsEditing(false);
  };

  const getTotalTime = () => {
    return group.exercises.reduce((total, exercise) => total + exercise.totalTime, 0);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <DragIcon sx={{ color: "text.secondary", cursor: "grab" }} />
            {isEditing ? (
              <Box display="flex" alignItems="center" gap={1}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSaveRename();
                    if (e.key === "Escape") handleCancelRename();
                  }}
                  onBlur={handleSaveRename}
                  autoFocus
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 500,
                    border: "1px solid #ccc",
                    padding: "4px 8px",
                    borderRadius: "4px",
                  }}
                />
              </Box>
            ) : (
              <>
                <SoftTypography variant="h5" fontWeight="medium">
                  {group.name}
                </SoftTypography>
                <Chip
                  label={`${group.exercises.length} exercises | ${getTotalTime()} min`}
                  size="small"
                  variant="outlined"
                />
              </>
            )}
          </Box>
          <Box>
            <SoftButton
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={onAddExercise}
              sx={{ mr: 1 }}
            >
              {t("PracticePlanner:addExercise")}
            </SoftButton>
            <IconButton onClick={handleMenuClick} size="small">
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleRename}>
                <EditIcon sx={{ mr: 1 }} fontSize="small" />
                {t("PracticePlanner:renameGroup")}
              </MenuItem>
              {group.id !== "warm-up" && group.id !== "practice" && (
                <MenuItem 
                  onClick={() => {
                    if (window.confirm(t("PracticePlanner:confirmRemoveGroup"))) {
                      onRemoveGroup(group.id);
                    }
                    handleMenuClose();
                  }}
                  sx={{ color: "error.main" }}
                >
                  <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                  {t("PracticePlanner:removeGroup")}
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {group.exercises.length === 0 ? (
          <Box
            textAlign="center"
            py={4}
            sx={{ 
              border: "2px dashed #e0e0e0", 
              borderRadius: 2,
              backgroundColor: "#fafafa" 
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t("PracticePlanner:noExercisesInGroup")}
            </Typography>
          </Box>
        ) : (
          <Box>
            {group.exercises.map((exercise, index) => (
              <ExerciseCard
                key={`${exercise.exerciseId}-${index}`}
                exercise={exercise}
                groupId={group.id}
                allGroups={allGroups}
                onRemove={onRemoveExercise}
                onMove={onMoveExercise}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PracticeGroupComponent;