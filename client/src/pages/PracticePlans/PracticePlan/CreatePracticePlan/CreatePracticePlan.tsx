import React, { useState } from "react";
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Chip,
  Grid,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../../../components/LayoutContainers";
import { useCreatePracticePlanMutation } from "../../../practicePlanApi";

const CreatePracticePlan: React.FC = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [createPracticePlan, { isLoading }] = useCreatePracticePlanMutation();

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Practice plan name is required");
      return;
    }

    try {
      const result = await createPracticePlan({
        name: name.trim(),
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      }).unwrap();

      navigate(`/practice-plans/${result._id}`);
    } catch (error: any) {
      setError(error?.data?.message || "Failed to create practice plan");
    }
  };

  const handleCancel = () => {
    navigate("/practice-plans");
  };

  return (
    <DashboardLayout>
      {() => (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" mb={3}>
            Create Practice Plan
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Practice Plan Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  required
                  helperText="Give your practice plan a descriptive name"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  helperText="Optional: Describe the goals and objectives of this practice"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box mb={2}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
                <Box display="flex" gap={2}>
                  <TextField
                    label="Add Tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    size="small"
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !name.trim()}
              >
                {isLoading ? "Creating..." : "Create Practice Plan"}
              </Button>
            </Box>
          </form>
        </Paper>

        <Box mt={3}>
          <Alert severity="info">
            <Typography variant="body2">
              A new practice plan will be created with default sections:
            </Typography>
            <ul>
              <li>Warm Up (with Chasers and Beaters groups)</li>
              <li>Main (with Chasers and Beaters groups)</li>
              <li>Cooldown (with Chasers and Beaters groups)</li>
            </ul>
            <Typography variant="body2">
              You can customize sections and groups after creating the practice plan.
            </Typography>
          </Alert>
        </Box>
      </Container>
      )}
    </DashboardLayout>
  );
};

export default CreatePracticePlan;