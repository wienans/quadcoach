import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { SoftButton } from "../../../../components";
import { PlayerGroup, ExerciseAssignment } from "../../../../api/quadcoachApi/domain";

interface PlayerGroupCardProps {
  group: PlayerGroup;
  sectionId: string;
  onUpdatePlayerGroup: (sectionId: string, groupId: string, updates: Partial<PlayerGroup>) => void;
  onDeletePlayerGroup: (sectionId: string, groupId: string) => void;
}

const PlayerGroupCard: React.FC<PlayerGroupCardProps> = ({
  group,
  sectionId,
  onUpdatePlayerGroup,
  onDeletePlayerGroup,
}) => {
  const { t } = useTranslation("practicePlanner");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditName(group.name);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onUpdatePlayerGroup(sectionId, group.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(group.name);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    onDeletePlayerGroup(sectionId, group.id);
    setDeleteDialogOpen(false);
  };

  const handleAddExercise = () => {
    // TODO: Open exercise selection dialog
    console.log("Add exercise to group:", group.id);
  };

  const handleRemoveExercise = (assignmentId: string) => {
    const updatedAssignments = group.exerciseAssignments.filter(
      (assignment: ExerciseAssignment) => assignment.id !== assignmentId
    );
    onUpdatePlayerGroup(sectionId, group.id, { exerciseAssignments: updatedAssignments });
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, ml: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <DragIcon sx={{ color: "text.secondary", mr: 2, cursor: "grab", fontSize: "small" }} />
        
        {isEditing ? (
          <TextField
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleSaveEdit}
            size="small"
            autoFocus
            sx={{ flexGrow: 1, mr: 2 }}
          />
        ) : (
          <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
            {group.name}
          </Typography>
        )}

        <IconButton size="small" onClick={handleMenuOpen}>
          <MoreIcon fontSize="small" />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            {t("editGroup")}
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            {t("deleteGroup")}
          </MenuItem>
        </Menu>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          {t("exercises")}
        </Typography>
        
        {group.exerciseAssignments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mb: 2 }}>
            No exercises assigned yet
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {group.exerciseAssignments.map((assignment: ExerciseAssignment) => (
              <Chip
                key={assignment.id}
                label={assignment.exerciseName}
                variant="outlined"
                size="small"
                onDelete={() => handleRemoveExercise(assignment.id)}
                deleteIcon={<RemoveIcon />}
              />
            ))}
          </Box>
        )}

        <SoftButton
          variant="text"
          color="info"
          startIcon={<AddIcon />}
          onClick={handleAddExercise}
          size="small"
        >
          {t("addExercise")}
        </SoftButton>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t("deleteGroup")}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the player group "{group.name}"? This will also remove all exercise assignments within it.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PlayerGroupCard;