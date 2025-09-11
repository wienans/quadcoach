import React, { useState, useCallback } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  Box,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../../components/LayoutContainers";
import {
  useGetPracticePlansQuery,
  useDeletePracticePlanMutation,
} from "../../practicePlanApi";
import { PracticePlan } from "../../../api/quadcoachApi/domain";
import debounce from "lodash/debounce";

type PracticePlanFilter = {
  searchValue: string;
  page: number;
  limit: number;
  sortBy: "name" | "created" | "updated";
  sortOrder: "asc" | "desc";
};

const PracticePlanList: React.FC = () => {
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState<PracticePlanFilter>({
    searchValue: "",
    page: 1,
    limit: 12,
    sortBy: "updated",
    sortOrder: "desc",
  });

  const {
    data: practicePlansData,
    isError: isPracticePlansError,
    isLoading: isPracticePlansLoading,
  } = useGetPracticePlansQuery({
    nameRegex: filter.searchValue || undefined,
    page: filter.page,
    limit: filter.limit,
    sortBy: filter.sortBy,
    sortOrder: filter.sortOrder,
  });

  const [deletePracticePlan] = useDeletePracticePlanMutation();

  const handleSearchChange = useCallback(
    debounce((value: string) => {
      setFilter((prev) => ({ ...prev, searchValue: value, page: 1 }));
    }, 300),
    []
  );

  const handleDeletePracticePlan = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this practice plan?")) {
      try {
        await deletePracticePlan(id).unwrap();
      } catch (error) {
        console.error("Failed to delete practice plan:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <DashboardLayout>
      {() => (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Practice Plans
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/practice-plans/add")}
          >
            Create Practice Plan
          </Button>
        </Box>

        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Search practice plans..."
            variant="outlined"
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {isPracticePlansLoading && (
          <Typography>Loading practice plans...</Typography>
        )}

        {isPracticePlansError && (
          <Typography color="error">
            Error loading practice plans. Please try again.
          </Typography>
        )}

        {practicePlansData && (
          <Grid container spacing={3}>
            {practicePlansData.practicePlans.map((practicePlan: PracticePlan) => (
              <Grid item xs={12} sm={6} md={4} key={practicePlan._id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" noWrap>
                      {practicePlan.name}
                    </Typography>
                    
                    {practicePlan.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {practicePlan.description}
                      </Typography>
                    )}

                    <Box mt={2}>
                      <Typography variant="body2" color="text.secondary" display="flex" alignItems="center">
                        <CalendarIcon sx={{ mr: 1, fontSize: 16 }} />
                        Updated: {formatDate(practicePlan.updatedAt)}
                      </Typography>
                    </Box>

                    <Box mt={2} display="flex" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        {practicePlan.sections.length} sections
                      </Typography>
                    </Box>

                    {practicePlan.tags && practicePlan.tags.length > 0 && (
                      <Box mt={2}>
                        {practicePlan.tags.slice(0, 3).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                        {practicePlan.tags.length > 3 && (
                          <Typography variant="body2" color="text.secondary">
                            +{practicePlan.tags.length - 3} more
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: "space-between" }}>
                    <Button
                      size="small"
                      onClick={() => navigate(`/practice-plans/${practicePlan._id}`)}
                    >
                      View
                    </Button>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/practice-plans/${practicePlan._id}/update`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePracticePlan(practicePlan._id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {practicePlansData?.practicePlans.length === 0 && (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6" color="text.secondary">
              No practice plans found
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Create your first practice plan to get started!
            </Typography>
          </Box>
        )}
      </Container>
      )}
    </DashboardLayout>
  );
};

export default PracticePlanList;