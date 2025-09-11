import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Add as AddIcon, Save as SaveIcon, Edit as EditIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SoftBox, SoftButton } from "../../../../components";
import { v4 as uuidv4 } from "uuid";
import { PracticePlan, PracticeSection, PlayerGroup } from "../../../../api/quadcoachApi/domain";
import SectionCard from "../components/SectionCard";

// Mock data - will be replaced with actual API
const getMockPracticePlan = (id: string): PracticePlan => ({
  _id: id,
  name: "Beginner Training Session",
  description: "A basic training session for new players focusing on fundamentals",
  tags: ["beginner", "fundamentals"],
  sections: [
    {
      id: "1",
      name: "Warm Up",
      order: 1,
      playerGroups: [
        {
          id: "1",
          name: "Chasers",
          order: 1,
          exerciseAssignments: [
            {
              id: "1",
              exerciseId: "ex1",
              exerciseName: "Basic Passing Drill",
              blockIds: ["block1"],
              order: 1
            }
          ]
        },
        {
          id: "2", 
          name: "Beaters",
          order: 2,
          exerciseAssignments: [
            {
              id: "2",
              exerciseId: "ex2", 
              exerciseName: "Bludger Handling",
              blockIds: ["block1", "block2"],
              order: 1
            }
          ]
        }
      ]
    },
    {
      id: "2",
      name: "Main",
      order: 2,
      playerGroups: [
        {
          id: "3",
          name: "Chasers",
          order: 1,
          exerciseAssignments: []
        },
        {
          id: "4",
          name: "Beaters", 
          order: 2,
          exerciseAssignments: []
        }
      ]
    },
    {
      id: "3",
      name: "Cooldown",
      order: 3,
      playerGroups: [
        {
          id: "5",
          name: "Chasers",
          order: 1,
          exerciseAssignments: []
        },
        {
          id: "6",
          name: "Beaters",
          order: 2, 
          exerciseAssignments: []
        }
      ]
    }
  ]
});

const ViewPracticePlanner: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("practicePlanner");
  
  const [practicePlan, setPracticePlan] = useState<PracticePlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", description: "", tags: [] as string[] });
  const [addSectionDialogOpen, setAddSectionDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  useEffect(() => {
    if (id) {
      // TODO: Replace with actual API call
      const mockData = getMockPracticePlan(id);
      setPracticePlan(mockData);
      setEditData({
        name: mockData.name,
        description: mockData.description || "",
        tags: mockData.tags || []
      });
    }
  }, [id]);

  const handleUpdateBasicInfo = () => {
    if (practicePlan) {
      setPracticePlan((prev: PracticePlan | null) => prev ? {
        ...prev,
        name: editData.name,
        description: editData.description,
        tags: editData.tags
      } : null);
    }
    setIsEditing(false);
  };

  const handleUpdateSection = (sectionId: string, updates: Partial<PracticeSection>) => {
    if (practicePlan) {
      setPracticePlan((prev: PracticePlan | null) => prev ? {
        ...prev,
        sections: prev.sections.map((section: PracticeSection) =>
          section.id === sectionId ? { ...section, ...updates } : section
        )
      } : null);
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    if (practicePlan) {
      setPracticePlan((prev: PracticePlan | null) => prev ? {
        ...prev,
        sections: prev.sections.filter((section: PracticeSection) => section.id !== sectionId)
      } : null);
    }
  };

  const handleAddSection = () => {
    if (newSectionName.trim() && practicePlan) {
      const newSection: PracticeSection = {
        id: uuidv4(),
        name: newSectionName.trim(),
        order: practicePlan.sections.length + 1,
        playerGroups: [
          {
            id: uuidv4(),
            name: "Chasers",
            order: 1,
            exerciseAssignments: []
          },
          {
            id: uuidv4(),
            name: "Beaters",
            order: 2,
            exerciseAssignments: []
          }
        ]
      };

      setPracticePlan((prev: PracticePlan | null) => prev ? {
        ...prev,
        sections: [...prev.sections, newSection]
      } : null);

      setNewSectionName("");
      setAddSectionDialogOpen(false);
    }
  };

  const handleAddPlayerGroup = (sectionId: string) => {
    if (practicePlan) {
      const section = practicePlan.sections.find((s: PracticeSection) => s.id === sectionId);
      if (section) {
        const newGroup: PlayerGroup = {
          id: uuidv4(),
          name: `Group ${section.playerGroups.length + 1}`,
          order: section.playerGroups.length + 1,
          exerciseAssignments: []
        };

        handleUpdateSection(sectionId, {
          playerGroups: [...section.playerGroups, newGroup]
        });
      }
    }
  };

  const handleUpdatePlayerGroup = (sectionId: string, groupId: string, updates: Partial<PlayerGroup>) => {
    if (practicePlan) {
      const section = practicePlan.sections.find((s: PracticeSection) => s.id === sectionId);
      if (section) {
        const updatedGroups = section.playerGroups.map((group: PlayerGroup) =>
          group.id === groupId ? { ...group, ...updates } : group
        );
        handleUpdateSection(sectionId, { playerGroups: updatedGroups });
      }
    }
  };

  const handleDeletePlayerGroup = (sectionId: string, groupId: string) => {
    if (practicePlan) {
      const section = practicePlan.sections.find((s: PracticeSection) => s.id === sectionId);
      if (section) {
        const updatedGroups = section.playerGroups.filter((group: PlayerGroup) => group.id !== groupId);
        handleUpdateSection(sectionId, { playerGroups: updatedGroups });
      }
    }
  };

  if (!practicePlan) {
    return (
      <SoftBox py={3}>
        <Typography>Loading...</Typography>
      </SoftBox>
    );
  }

  return (
    <SoftBox py={3}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
              <div style={{ flexGrow: 1 }}>
                {isEditing ? (
                  <Box>
                    <TextField
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      multiline
                      rows={2}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h4" fontWeight="medium" gutterBottom>
                      {practicePlan.name}
                    </Typography>
                    {practicePlan.description && (
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {practicePlan.description}
                      </Typography>
                    )}
                  </Box>
                )}

                {practicePlan.tags && practicePlan.tags.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    {practicePlan.tags.map((tag: string, index: number) => (
                      <Chip key={index} label={tag} color="primary" variant="outlined" size="small" />
                    ))}
                  </Box>
                )}
              </div>

              <Box sx={{ ml: 2 }}>
                {isEditing ? (
                  <Box>
                    <SoftButton
                      variant="gradient"
                      color="info"
                      onClick={handleUpdateBasicInfo}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      {t("save")}
                    </SoftButton>
                    <SoftButton
                      variant="outlined"
                      onClick={() => setIsEditing(false)}
                      size="small"
                    >
                      {t("cancel")}
                    </SoftButton>
                  </Box>
                ) : (
                  <SoftButton
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                    size="small"
                  >
                    {t("edit")}
                  </SoftButton>
                )}
              </Box>
            </Box>
          </Paper>

          <Typography variant="h5" gutterBottom>
            {t("sections")}
          </Typography>

          {practicePlan.sections.map((section: PracticeSection) => (
            <SectionCard
              key={section.id}
              section={section}
              onUpdateSection={handleUpdateSection}
              onDeleteSection={handleDeleteSection}
              onAddPlayerGroup={handleAddPlayerGroup}
              onUpdatePlayerGroup={handleUpdatePlayerGroup}
              onDeletePlayerGroup={handleDeletePlayerGroup}
            />
          ))}

          <SoftButton
            variant="outlined"
            color="info"
            startIcon={<AddIcon />}
            onClick={() => setAddSectionDialogOpen(true)}
          >
            {t("addSection")}
          </SoftButton>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: "sticky", top: 24 }}>
            <Typography variant="h6" gutterBottom>
              Practice Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Sections: {practicePlan.sections.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Player Groups: {practicePlan.sections.reduce((acc: number, section: PracticeSection) => acc + section.playerGroups.length, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Exercises: {practicePlan.sections.reduce((acc: number, section: PracticeSection) => 
                  acc + section.playerGroups.reduce((groupAcc: number, group: PlayerGroup) => groupAcc + group.exerciseAssignments.length, 0), 0
                )}
              </Typography>
            </Box>

            <SoftButton
              variant="gradient"
              color="success"
              startIcon={<SaveIcon />}
              fullWidth
              onClick={() => console.log("Save practice plan")}
            >
              {t("save")} {t("practice")}
            </SoftButton>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={addSectionDialogOpen} onClose={() => setAddSectionDialogOpen(false)}>
        <DialogTitle>{t("addSection")}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t("name")}
            fullWidth
            variant="outlined"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddSection()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSectionDialogOpen(false)}>
            {t("cancel")}
          </Button>
          <Button 
            onClick={handleAddSection} 
            variant="contained"
            disabled={!newSectionName.trim()}
          >
            {t("add")}
          </Button>
        </DialogActions>
      </Dialog>
    </SoftBox>
  );
};

export default ViewPracticePlanner;