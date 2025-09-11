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
  Button
} from "@mui/material";
import {
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { SoftButton } from "../../../../components";
import { PracticeSection, PlayerGroup } from "../../../../api/quadcoachApi/domain";
import PlayerGroupCard from "./PlayerGroupCard";

interface SectionCardProps {
  section: PracticeSection;
  onUpdateSection: (sectionId: string, updates: Partial<PracticeSection>) => void;
  onDeleteSection: (sectionId: string) => void;
  onAddPlayerGroup: (sectionId: string) => void;
  onUpdatePlayerGroup: (sectionId: string, groupId: string, updates: Partial<PlayerGroup>) => void;
  onDeletePlayerGroup: (sectionId: string, groupId: string) => void;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  onUpdateSection,
  onDeleteSection,
  onAddPlayerGroup,
  onUpdatePlayerGroup,
  onDeletePlayerGroup,
}) => {
  const { t } = useTranslation("practicePlanner");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditName(section.name);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onUpdateSection(section.id, { name: editName.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(section.name);
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
    onDeleteSection(section.id);
    setDeleteDialogOpen(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <DragIcon sx={{ color: "text.secondary", mr: 2, cursor: "grab" }} />
        
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
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {section.name}
          </Typography>
        )}

        <IconButton onClick={handleMenuOpen}>
          <MoreIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            {t("renameSection")}
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            {t("deleteSection")}
          </MenuItem>
        </Menu>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t("playerGroups")}
        </Typography>
        
        {section.playerGroups.map((group: PlayerGroup) => (
          <PlayerGroupCard
            key={group.id}
            group={group}
            sectionId={section.id}
            onUpdatePlayerGroup={onUpdatePlayerGroup}
            onDeletePlayerGroup={onDeletePlayerGroup}
          />
        ))}

        <SoftButton
          variant="outlined"
          color="info"
          startIcon={<AddIcon />}
          onClick={() => onAddPlayerGroup(section.id)}
          size="small"
          sx={{ mt: 2 }}
        >
          {t("addGroup")}
        </SoftButton>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t("deleteSection")}</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the section "{section.name}"? This will also remove all player groups and exercise assignments within it.
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

export default SectionCard;