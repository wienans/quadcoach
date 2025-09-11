import React from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../../../components/LayoutContainers";
import {
  useGetPracticePlanQuery,
  useDeletePracticePlanMutation,
} from "../../../practicePlanApi";

const ViewPracticePlan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: practicePlan,
    isError,
    isLoading,
  } = useGetPracticePlanQuery(id!);

  const [deletePracticePlan] = useDeletePracticePlanMutation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this practice plan?")) {
      try {
        await deletePracticePlan(id!).unwrap();
        navigate("/practice-plans");
      } catch (error) {
        console.error("Failed to delete practice plan:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        {() => (
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography>Loading practice plan...</Typography>
          </Container>
        )}
      </DashboardLayout>
    );
  }

  if (isError || !practicePlan) {
    return (
      <DashboardLayout>
        {() => (
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography color="error">
              Error loading practice plan. Please try again.
            </Typography>
          </Container>
        )}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {() => (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {practicePlan.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography
                variant="body2"
                color="text.secondary"
                display="flex"
                alignItems="center"
              >
                <CalendarIcon sx={{ mr: 1, fontSize: 16 }} />
                Created: {formatDate(practicePlan.createdAt)}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                display="flex"
                alignItems="center"
              >
                <CalendarIcon sx={{ mr: 1, fontSize: 16 }} />
                Updated: {formatDate(practicePlan.updatedAt)}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/practice-plans/${id}/update`)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <IconButton onClick={handleDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Description */}
        {practicePlan.description && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1">{practicePlan.description}</Typography>
          </Paper>
        )}

        {/* Tags */}
        {practicePlan.tags && practicePlan.tags.length > 0 && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tags
            </Typography>
            <Box>
              {practicePlan.tags.map((tag, index) => (
                <Chip key={index} label={tag} sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>
          </Paper>
        )}

        {/* Practice Sections */}
        <Typography variant="h5" component="h2" gutterBottom>
          Practice Sections
        </Typography>

        <Grid container spacing={3}>
          {practicePlan.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <Grid item xs={12} key={section._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {section.name}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      {section.playerGroups
                        .sort((a, b) => a.order - b.order)
                        .map((group) => (
                          <Grid item xs={12} md={6} key={group._id}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 2, backgroundColor: "grey.50" }}
                            >
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                display="flex"
                                alignItems="center"
                                gutterBottom
                              >
                                <PersonIcon sx={{ mr: 1, fontSize: 18 }} />
                                {group.name}
                              </Typography>
                              
                              {group.exerciseBlocks.length > 0 ? (
                                <Box>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {group.exerciseBlocks.length} exercise block(s)
                                  </Typography>
                                  {/* Here we would list the exercise blocks */}
                                  {group.exerciseBlocks
                                    .sort((a, b) => a.order - b.order)
                                    .map((block) => (
                                      <Chip
                                        key={block._id}
                                        label={`Exercise ${block.exerciseId.substring(0, 8)}...`}
                                        size="small"
                                        sx={{ mr: 1, mb: 1 }}
                                      />
                                    ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary" style={{ fontStyle: "italic" }}>
                                  No exercises assigned yet
                                </Typography>
                              )}
                            </Paper>
                          </Grid>
                        ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>

        {practicePlan.sections.length === 0 && (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              No sections configured
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Edit this practice plan to add sections and exercises
            </Typography>
          </Paper>
        )}
      </Container>
      )}
    </DashboardLayout>
  );
};

export default ViewPracticePlan;