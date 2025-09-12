import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { SoftButton } from "../../../components";
import { useGetExercisesQuery } from "../../exerciseApi";
import { Exercise, PracticeGroup, SelectedExercise, SelectedBlock } from "../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";

interface ExerciseSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: SelectedExercise, groupId: string) => void;
  groups: PracticeGroup[];
}

const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  open,
  onClose,
  onSelectExercise,
  groups,
}) => {
  const { t } = useTranslation("PracticePlanner");
  const { data: exercisesData, isLoading } = useGetExercisesQuery({});
  
  const exercises = exercisesData?.exercises || [];
  
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedBlocks, setSelectedBlocks] = useState<Record<string, boolean>>({});
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  const filteredExercises = exercises.filter((exercise: Exercise) =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    // Initialize all blocks as unselected
    const blockSelection: Record<string, boolean> = {};
    exercise.description_blocks.forEach(block => {
      blockSelection[block._id] = false;
    });
    setSelectedBlocks(blockSelection);
  };

  const handleBlockToggle = (blockId: string) => {
    setSelectedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  };

  const handleSelectAll = () => {
    if (!selectedExercise) return;
    
    const allSelected = selectedExercise.description_blocks.every(block => selectedBlocks[block._id]);
    const newSelection: Record<string, boolean> = {};
    
    selectedExercise.description_blocks.forEach(block => {
      newSelection[block._id] = !allSelected;
    });
    
    setSelectedBlocks(newSelection);
  };

  const handleAddToGroup = () => {
    if (!selectedExercise || !selectedGroupId) return;

    const selectedBlocksArray: SelectedBlock[] = selectedExercise.description_blocks.map(block => ({
      blockId: block._id,
      block,
      selected: selectedBlocks[block._id] || false,
    }));

    const totalTime = selectedBlocksArray
      .filter(sb => sb.selected)
      .reduce((total, sb) => total + (sb.block.time_min || 0), 0);

    const exerciseToAdd: SelectedExercise = {
      exerciseId: selectedExercise._id,
      exerciseName: selectedExercise.name,
      selectedBlocks: selectedBlocksArray,
      totalTime,
    };

    onSelectExercise(exerciseToAdd, selectedGroupId);
    handleClose();
  };

  const handleClose = () => {
    setSelectedExercise(null);
    setSelectedBlocks({});
    setSearchTerm("");
    onClose();
  };

  const getSelectedBlocksCount = () => {
    return Object.values(selectedBlocks).filter(Boolean).length;
  };

  const getSelectedBlocksTime = () => {
    if (!selectedExercise) return 0;
    return selectedExercise.description_blocks
      .filter(block => selectedBlocks[block._id])
      .reduce((total, block) => total + (block.time_min || 0), 0);
  };

  const canAddToGroup = selectedExercise && getSelectedBlocksCount() > 0 && selectedGroupId;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {t("PracticePlanner:selectExercises")}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Exercise List */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Exercises
            </Typography>
            
            <TextField
              fullWidth
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {isLoading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress />
              </Box>
            ) : (
              <List sx={{ maxHeight: 400, overflow: "auto" }}>
                {filteredExercises.map((exercise: Exercise) => (
                  <ListItem
                    key={exercise._id}
                    button
                    selected={selectedExercise?._id === exercise._id}
                    onClick={() => handleExerciseSelect(exercise)}
                  >
                    <ListItemText
                      primary={exercise.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {exercise.description_blocks.length} blocks | {exercise.time_min} min total
                          </Typography>
                          {exercise.tags && exercise.tags.length > 0 && (
                            <Box mt={0.5}>
                              {exercise.tags.slice(0, 3).map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                              {exercise.tags.length > 3 && (
                                <Chip
                                  label={`+${exercise.tags.length - 3}`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>

          {/* Block Selection */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {t("PracticePlanner:selectBlocks")}
            </Typography>

            {selectedExercise ? (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    {selectedExercise.name}
                  </Typography>
                  <SoftButton
                    size="small"
                    variant="outlined"
                    onClick={handleSelectAll}
                  >
                    {selectedExercise.description_blocks.every(block => selectedBlocks[block._id])
                      ? "Deselect All"
                      : "Select All"}
                  </SoftButton>
                </Box>

                <List sx={{ maxHeight: 350, overflow: "auto" }}>
                  {selectedExercise.description_blocks.map((block, index) => (
                    <ListItem key={block._id} sx={{ py: 0.5 }}>
                      <ListItemIcon>
                        <Checkbox
                          checked={selectedBlocks[block._id] || false}
                          onChange={() => handleBlockToggle(block._id)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body2" fontWeight="medium">
                              Block {index + 1}
                            </Typography>
                            <Chip
                              icon={<TimeIcon />}
                              label={`${block.time_min || 0} min`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          block.description && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {block.description.substring(0, 100)}
                              {block.description.length > 100 && "..."}
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                {getSelectedBlocksCount() > 0 && (
                  <Card variant="outlined" sx={{ mt: 2 }}>
                    <CardContent sx={{ py: 1.5 }}>
                      <Typography variant="body2">
                        <strong>Selected:</strong> {getSelectedBlocksCount()} blocks | {getSelectedBlocksTime()} min
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            ) : (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height={200}
                sx={{ 
                  border: "2px dashed #e0e0e0", 
                  borderRadius: 2,
                  backgroundColor: "#fafafa" 
                }}
              >
                <Typography variant="body1" color="text.secondary">
                  Select an exercise to choose blocks
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Group Selection */}
        {selectedExercise && getSelectedBlocksCount() > 0 && (
          <Box mt={3}>
            <FormControl fullWidth>
              <InputLabel>{t("PracticePlanner:selectGroup")}</InputLabel>
              <Select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                label={t("PracticePlanner:selectGroup")}
              >
                {groups.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name} ({group.exercises.length} exercises)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <SoftButton onClick={handleClose}>
          Cancel
        </SoftButton>
        <SoftButton
          variant="contained"
          color="primary"
          onClick={handleAddToGroup}
          disabled={!canAddToGroup}
        >
          {t("PracticePlanner:addToGroup")}
        </SoftButton>
      </DialogActions>
    </Dialog>
  );
};

export default ExerciseSelector;