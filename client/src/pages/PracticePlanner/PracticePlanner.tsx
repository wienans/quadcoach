import { useState } from "react";
import { Card, Grid, Typography } from "@mui/material";
import { SoftBox, SoftButton, SoftTypography } from "../../components";
import { DashboardLayout } from "../../components/LayoutContainers";
import { useTranslation } from "react-i18next";
import "./translations";
import { PracticeGroup, SelectedExercise } from "../../api/quadcoachApi/domain";
import PracticeGroupComponent from "./components/PracticeGroupComponent";
import ExerciseSelector from "./components/ExerciseSelector";
import GroupManager from "./components/GroupManager";

const PracticePlannerRoot = () => {
  const { t } = useTranslation("PracticePlanner");
  
  const [groups, setGroups] = useState<PracticeGroup[]>([
    {
      id: "warm-up",
      name: "Warm Up",
      exercises: [],
      order: 0,
    },
    {
      id: "practice",
      name: "Practice",
      exercises: [],
      order: 1,
    },
  ]);

  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  const handleAddExercise = (exercise: SelectedExercise, groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, exercises: [...group.exercises, exercise] }
        : group
    ));
  };

  const handleRemoveExercise = (exerciseId: string, groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, exercises: group.exercises.filter(ex => ex.exerciseId !== exerciseId) }
        : group
    ));
  };

  const handleMoveExercise = (exerciseId: string, fromGroupId: string, toGroupId: string) => {
    const exercise = groups.find(g => g.id === fromGroupId)?.exercises.find(e => e.exerciseId === exerciseId);
    if (exercise) {
      handleRemoveExercise(exerciseId, fromGroupId);
      handleAddExercise(exercise, toGroupId);
    }
  };

  const handleAddGroup = (name: string) => {
    const newGroup: PracticeGroup = {
      id: `group-${Date.now()}`,
      name,
      exercises: [],
      order: groups.length,
    };
    setGroups(prev => [...prev, newGroup]);
  };

  const handleRemoveGroup = (groupId: string) => {
    setGroups(prev => prev.filter(group => group.id !== groupId));
  };

  const handleRenameGroup = (groupId: string, newName: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, name: newName }
        : group
    ));
  };

  const handleReorderGroups = (newGroups: PracticeGroup[]) => {
    setGroups(newGroups);
  };

  const getTotalTime = () => {
    return groups.reduce((total, group) => 
      total + group.exercises.reduce((groupTotal, exercise) => 
        groupTotal + exercise.totalTime, 0
      ), 0
    );
  };

  return (
    <DashboardLayout
      header={(scrollTrigger) => (
        <Card
          sx={(theme) => ({
            position: "sticky",
            top: theme.spacing(1),
            zIndex: 1,
            ...(scrollTrigger
              ? {
                  backgroundColor: theme.palette.transparent.main,
                  boxShadow: theme.boxShadows.navbarBoxShadow,
                  backdropFilter: `saturate(200%) blur(${theme.functions.pxToRem(30)})`,
                }
              : {
                  backgroundColor: theme.palette.white.main,
                }),
          })}
        >
          <SoftBox p={2}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <SoftTypography variant="h4" fontWeight="medium">
                  {t("PracticePlanner:title")}
                </SoftTypography>
                <Typography variant="body2" color="text.secondary">
                  {t("PracticePlanner:subtitle")} | {t("PracticePlanner:totalTime")}: {getTotalTime()} min
                </Typography>
              </Grid>
              <Grid item>
                <SoftButton
                  variant="contained"
                  color="primary"
                  onClick={() => setShowExerciseSelector(true)}
                >
                  {t("PracticePlanner:addExercise")}
                </SoftButton>
              </Grid>
            </Grid>
          </SoftBox>
        </Card>
      )}
    >
      {() => (
        <SoftBox py={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <SoftBox>
                {groups
                  .sort((a, b) => a.order - b.order)
                  .map((group) => (
                    <PracticeGroupComponent
                      key={group.id}
                      group={group}
                      allGroups={groups}
                      onAddExercise={() => setShowExerciseSelector(true)}
                      onRemoveExercise={handleRemoveExercise}
                      onMoveExercise={handleMoveExercise}
                      onRemoveGroup={handleRemoveGroup}
                      onRenameGroup={handleRenameGroup}
                    />
                  ))}
              </SoftBox>
            </Grid>
            <Grid item xs={12} lg={4}>
              <GroupManager
                groups={groups}
                onAddGroup={handleAddGroup}
                onRemoveGroup={handleRemoveGroup}
                onRenameGroup={handleRenameGroup}
                onReorderGroups={handleReorderGroups}
              />
            </Grid>
          </Grid>

          <ExerciseSelector
            open={showExerciseSelector}
            onClose={() => setShowExerciseSelector(false)}
            onSelectExercise={handleAddExercise}
            groups={groups}
          />
        </SoftBox>
      )}
    </DashboardLayout>
  );
};

export default PracticePlannerRoot;