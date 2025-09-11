import { useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";

// Soft UI Dashboard React components
import { SoftBox, SoftTypography } from "../../components";

// Types
interface ExerciseBlock {
  id: string;
  exerciseId: string;
  blockId: string;
  name: string;
}

interface PlayerGroup {
  id: string;
  name: string;
  exercises: ExerciseBlock[];
}

interface PracticeSection {
  id: string;
  name: string;
  playerGroups: PlayerGroup[];
}

interface PracticePlan {
  id: string;
  name: string;
  description: string;
  tags: string[];
  sections: PracticeSection[];
}

const PracticePlanner = () => {
  // Initialize with default structure
  const [practicePlan, setPracticePlan] = useState<PracticePlan>({
    id: "1",
    name: "New Practice Plan",
    description: "",
    tags: [],
    sections: [
      {
        id: "warm-up",
        name: "Warm Up",
        playerGroups: [
          { id: "chasers-warm", name: "Chasers", exercises: [] },
          { id: "beaters-warm", name: "Beaters", exercises: [] },
        ],
      },
      {
        id: "main",
        name: "Main",
        playerGroups: [
          { id: "chasers-main", name: "Chasers", exercises: [] },
          { id: "beaters-main", name: "Beaters", exercises: [] },
        ],
      },
      {
        id: "cooldown",
        name: "Cooldown",
        playerGroups: [
          { id: "chasers-cool", name: "Chasers", exercises: [] },
          { id: "beaters-cool", name: "Beaters", exercises: [] },
        ],
      },
    ],
  });

  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !practicePlan.tags.includes(newTag.trim())) {
      setPracticePlan(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPracticePlan(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSection = () => {
    const newSection: PracticeSection = {
      id: `section-${Date.now()}`,
      name: "New Section",
      playerGroups: [
        { id: `chasers-${Date.now()}`, name: "Chasers", exercises: [] },
        { id: `beaters-${Date.now()}`, name: "Beaters", exercises: [] },
      ],
    };
    setPracticePlan(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const removeSection = (sectionId: string) => {
    setPracticePlan(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  const updateSectionName = (sectionId: string, newName: string) => {
    setPracticePlan(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, name: newName } : section
      )
    }));
  };

  const addPlayerGroup = (sectionId: string) => {
    const newGroup: PlayerGroup = {
      id: `group-${Date.now()}`,
      name: "New Group",
      exercises: [],
    };
    setPracticePlan(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId 
          ? { ...section, playerGroups: [...section.playerGroups, newGroup] }
          : section
      )
    }));
  };

  const removePlayerGroup = (sectionId: string, groupId: string) => {
    setPracticePlan(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId 
          ? { ...section, playerGroups: section.playerGroups.filter(group => group.id !== groupId) }
          : section
      )
    }));
  };

  const updatePlayerGroupName = (sectionId: string, groupId: string, newName: string) => {
    setPracticePlan(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId 
          ? {
              ...section,
              playerGroups: section.playerGroups.map(group =>
                group.id === groupId ? { ...group, name: newName } : group
              )
            }
          : section
      )
    }));
  };

  return (
    <SoftBox py={3}>
      <SoftBox mb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <SoftBox p={3}>
                <SoftTypography variant="h4" gutterBottom>
                  Practice Planner
                </SoftTypography>
                
                {/* Practice Plan Details */}
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Practice Plan Name"
                      value={practicePlan.name}
                      onChange={(e) => setPracticePlan(prev => ({ ...prev, name: e.target.value }))}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TextField
                        label="Add Tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        size="small"
                      />
                      <Button onClick={addTag} variant="contained" size="small">
                        Add
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={practicePlan.description}
                      onChange={(e) => setPracticePlan(prev => ({ ...prev, description: e.target.value }))}
                      multiline
                      rows={3}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {practicePlan.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          onDelete={() => removeTag(tag)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>

                {/* Sections */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <SoftTypography variant="h5">
                    Practice Sections
                  </SoftTypography>
                  <Button
                    onClick={addSection}
                    startIcon={<AddIcon />}
                    variant="contained"
                    color="primary"
                  >
                    Add Section
                  </Button>
                </Box>

                {practicePlan.sections.map((section) => (
                  <Card key={section.id} sx={{ mb: 2, border: 1, borderColor: 'grey.300' }}>
                    <SoftBox p={2}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <DragHandleIcon color="action" />
                          <TextField
                            value={section.name}
                            onChange={(e) => updateSectionName(section.id, e.target.value)}
                            variant="standard"
                            sx={{ '& .MuiInput-input': { fontSize: '1.25rem', fontWeight: 'bold' } }}
                          />
                        </Box>
                        <Box>
                          <Button
                            onClick={() => addPlayerGroup(section.id)}
                            startIcon={<AddIcon />}
                            size="small"
                            variant="outlined"
                          >
                            Add Group
                          </Button>
                          <IconButton
                            onClick={() => removeSection(section.id)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        {section.playerGroups.map((group) => (
                          <Grid item xs={12} md={6} key={group.id}>
                            <Card sx={{ border: 1, borderColor: 'grey.200' }}>
                              <SoftBox p={2}>
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                                  <TextField
                                    value={group.name}
                                    onChange={(e) => updatePlayerGroupName(section.id, group.id, e.target.value)}
                                    variant="standard"
                                    size="small"
                                  />
                                  <IconButton
                                    onClick={() => removePlayerGroup(section.id, group.id)}
                                    color="error"
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                                
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Exercises: {group.exercises.length}
                                </Typography>
                                
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  size="small"
                                  startIcon={<AddIcon />}
                                >
                                  Add Exercise Block
                                </Button>
                              </SoftBox>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </SoftBox>
                  </Card>
                ))}
              </SoftBox>
            </Card>
          </Grid>
        </Grid>
      </SoftBox>
    </SoftBox>
  );
};

export default PracticePlanner;