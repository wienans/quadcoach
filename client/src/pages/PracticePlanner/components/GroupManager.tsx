import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { SoftTypography, SoftButton } from "../../../components";
import { PracticeGroup } from "../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";

interface GroupManagerProps {
  groups: PracticeGroup[];
  onAddGroup: (name: string) => void;
  onRemoveGroup: (groupId: string) => void;
  onRenameGroup: (groupId: string, newName: string) => void;
  onReorderGroups: (newGroups: PracticeGroup[]) => void;
}

const GroupManager: React.FC<GroupManagerProps> = ({
  groups,
  onAddGroup,
  onRemoveGroup,
  onRenameGroup,
  onReorderGroups,
}) => {
  const { t } = useTranslation("PracticePlanner");
  const [newGroupName, setNewGroupName] = useState("");
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      onAddGroup(newGroupName.trim());
      setNewGroupName("");
    }
  };

  const handleStartEdit = (groupId: string, currentName: string) => {
    setEditingGroup(groupId);
    setEditName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingGroup && editName.trim()) {
      onRenameGroup(editingGroup, editName.trim());
    }
    setEditingGroup(null);
    setEditName("");
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setEditName("");
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newGroups = [...groups];
      [newGroups[index], newGroups[index - 1]] = [newGroups[index - 1], newGroups[index]];
      newGroups.forEach((group, idx) => {
        group.order = idx;
      });
      onReorderGroups(newGroups);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < groups.length - 1) {
      const newGroups = [...groups];
      [newGroups[index], newGroups[index + 1]] = [newGroups[index + 1], newGroups[index]];
      newGroups.forEach((group, idx) => {
        group.order = idx;
      });
      onReorderGroups(newGroups);
    }
  };

  const sortedGroups = [...groups].sort((a, b) => a.order - b.order);

  return (
    <Card>
      <CardContent>
        <SoftTypography variant="h6" fontWeight="medium" mb={2}>
          {t("PracticePlanner:groups", "Manage Groups")}
        </SoftTypography>

        {/* Add new group */}
        <Box mb={3}>
          <TextField
            fullWidth
            size="small"
            placeholder={t("PracticePlanner:groupName")}
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleAddGroup();
            }}
            sx={{ mb: 1 }}
          />
          <SoftButton
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddGroup}
            disabled={!newGroupName.trim()}
          >
            {t("PracticePlanner:addGroup")}
          </SoftButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Group list */}
        <List>
          {sortedGroups.map((group, index) => (
            <ListItem key={group.id} divider={index < sortedGroups.length - 1}>
              <ListItemText
                primary={
                  editingGroup === group.id ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <TextField
                        size="small"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <IconButton size="small" onClick={handleSaveEdit} color="primary">
                        <SaveIcon />
                      </IconButton>
                      <IconButton size="small" onClick={handleCancelEdit}>
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    group.name
                  )
                }
                secondary={`${group.exercises.length} exercises`}
              />
              <ListItemSecondaryAction>
                <Box display="flex" alignItems="center">
                  <IconButton
                    size="small"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === sortedGroups.length - 1}
                  >
                    <ArrowDownIcon />
                  </IconButton>
                  {editingGroup !== group.id && (
                    <IconButton
                      size="small"
                      onClick={() => handleStartEdit(group.id, group.name)}
                    >
                      <EditIcon />
                    </IconButton>
                  )}
                  {/* Only allow deletion of custom groups (not warm-up or practice) */}
                  {group.id !== "warm-up" && group.id !== "practice" && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        if (window.confirm(t("PracticePlanner:confirmRemoveGroup"))) {
                          onRemoveGroup(group.id);
                        }
                      }}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {sortedGroups.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
            No groups yet. Add your first group above.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupManager;