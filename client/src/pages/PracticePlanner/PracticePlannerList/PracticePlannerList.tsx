import React from "react";
import { Box, Typography, Grid, Card, CardContent, CardActions, Chip, IconButton } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SoftBox, SoftButton } from "../../../components";

// Mock data for now - will be replaced with actual API
const mockPracticePlans = [
  {
    _id: "1",
    name: "Beginner Training Session",
    description: "A basic training session for new players focusing on fundamentals",
    tags: ["beginner", "fundamentals"],
    sections: [
      { id: "1", name: "Warm Up", order: 1, playerGroups: [] },
      { id: "2", name: "Main", order: 2, playerGroups: [] },
      { id: "3", name: "Cooldown", order: 3, playerGroups: [] }
    ]
  },
  {
    _id: "2", 
    name: "Advanced Tactics Training",
    description: "Advanced tactical training session for experienced players",
    tags: ["advanced", "tactics"],
    sections: [
      { id: "1", name: "Warm Up", order: 1, playerGroups: [] },
      { id: "2", name: "Main", order: 2, playerGroups: [] }
    ]
  }
];

const PracticePlannerList: React.FC = () => {
  const { t } = useTranslation("practicePlanner");
  const navigate = useNavigate();

  const handleEdit = (planId: string) => {
    navigate(`/practice-planners/${planId}`);
  };

  const handleDelete = (planId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete plan:", planId);
  };

  const handleAddNew = () => {
    navigate("/practice-planners/add");
  };

  return (
    <SoftBox py={3}>
      <SoftBox mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="h4" fontWeight="medium">
            {t("practiceList")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your practice training plans
          </Typography>
        </div>
        <SoftButton 
          variant="gradient" 
          color="info"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          {t("addPractice")}
        </SoftButton>
      </SoftBox>

      <Grid container spacing={3}>
        {mockPracticePlans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan._id}>
            <Card 
              sx={{ 
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-2px)",
                  transition: "all 0.3s ease-in-out"
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom>
                  {plan.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {plan.description}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" display="block" gutterBottom>
                    {t("sections")}: {plan.sections.length}
                  </Typography>
                </Box>

                {plan.tags && plan.tags.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {plan.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
              
              <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                <SoftButton 
                  variant="text"
                  color="info"
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit(plan._id)}
                  size="small"
                >
                  {t("edit")}
                </SoftButton>
                <IconButton
                  color="error"
                  onClick={() => handleDelete(plan._id)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {mockPracticePlans.length === 0 && (
        <Box 
          sx={{
            textAlign: "center",
            py: 8,
            px: 3
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No practice plans found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first practice plan to get started
          </Typography>
          <SoftButton 
            variant="gradient"
            color="info"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
          >
            {t("addPractice")}
          </SoftButton>
        </Box>
      )}
    </SoftBox>
  );
};

export default PracticePlannerList;