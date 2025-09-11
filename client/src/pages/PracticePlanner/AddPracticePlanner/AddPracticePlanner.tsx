import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Chip, 
  Grid, 
  Paper,
  Divider
} from "@mui/material";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SoftBox, SoftButton, SoftInput } from "../../../components";
import { v4 as uuidv4 } from "uuid";
import { PracticeSection, PlayerGroup } from "../../../api/quadcoachApi/domain";

const defaultSections: Omit<PracticeSection, "id">[] = [
  { name: "Warm Up", order: 1, playerGroups: [] },
  { name: "Main", order: 2, playerGroups: [] },
  { name: "Cooldown", order: 3, playerGroups: [] }
];

const defaultPlayerGroups: Omit<PlayerGroup, "id">[] = [
  { name: "Chasers", order: 1, exerciseAssignments: [] },
  { name: "Beaters", order: 2, exerciseAssignments: [] }
];

const AddPracticePlanner: React.FC = () => {
  const { t } = useTranslation("practicePlanner");
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: [] as string[]
  });
  
  const [tagInput, setTagInput] = useState("");
  
  const [sections] = useState<PracticeSection[]>(() => 
    defaultSections.map(section => ({
      ...section,
      id: uuidv4(),
      playerGroups: defaultPlayerGroups.map(group => ({
        ...group,
        id: uuidv4(),
        exerciseAssignments: []
      }))
    }))
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    const practicePlan = {
      _id: uuidv4(),
      ...formData,
      sections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log("Saving practice plan:", practicePlan);
    
    // For now, just navigate back
    navigate("/practice-planners");
  };

  const handleCancel = () => {
    navigate("/practice-planners");
  };

  return (
    <SoftBox py={3}>
      <SoftBox mb={3}>
        <Typography variant="h4" fontWeight="medium" gutterBottom>
          {t("addPractice")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a new practice training plan
        </Typography>
      </SoftBox>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            
            <SoftBox mb={3}>
              <SoftInput
                placeholder={t("name")}
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleInputChange("name", e.target.value)
                }
                fullWidth
              />
            </SoftBox>

            <SoftBox mb={3}>
              <TextField
                placeholder={t("practiceDescription")}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                multiline
                rows={3}
                fullWidth
                variant="outlined"
              />
            </SoftBox>

            <Typography variant="subtitle2" gutterBottom>
              {t("tags")}
            </Typography>
            
            <SoftBox mb={2}>
              <TextField
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                size="small"
                sx={{ mr: 1 }}
              />
              <SoftButton
                variant="outlined"
                color="info"
                onClick={handleAddTag}
                size="small"
              >
                {t("add")}
              </SoftButton>
            </SoftBox>

            {formData.tags.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Practice Structure
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your practice will have the following default sections with player groups:
            </Typography>

            {sections.map((section, index) => (
              <Paper key={section.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  {index + 1}. {section.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Player Groups: {section.playerGroups.map((g: PlayerGroup) => g.name).join(", ")}
                </Typography>
              </Paper>
            ))}
            
            <Typography variant="caption" color="text.secondary">
              You can customize sections and player groups after creating the practice plan.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: "sticky", top: 24 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            
            <SoftBox display="flex" flexDirection="column" gap={2}>
              <SoftButton
                variant="gradient"
                color="info"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!formData.name.trim()}
                fullWidth
              >
                {t("save")}
              </SoftButton>
              
              <SoftButton
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                fullWidth
              >
                {t("cancel")}
              </SoftButton>
            </SoftBox>
          </Paper>
        </Grid>
      </Grid>
    </SoftBox>
  );
};

export default AddPracticePlanner;