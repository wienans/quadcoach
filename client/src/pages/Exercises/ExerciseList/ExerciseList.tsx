import "./translations";
import {
  ChangeEvent,
  useState,
  KeyboardEvent,
} from "react";
import {
  Alert,
  Card,
  CardHeader,
  Grid,
  Slider,
  Theme,
  ToggleButton,
  useMediaQuery,
  Chip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Popover,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  SoftTypography,
  SoftInput,
  SoftBox,
  SoftButton,
} from "../../../components";
import { useTranslation } from "react-i18next";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import ExercisesCardView from "./cardView/ExercisesCardView";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ClearIcon from "@mui/icons-material/Clear";
import SortIcon from "@mui/icons-material/Sort";
import {
  useLazyGetExercisesQuery,
  useAddExerciseMutation,
} from "../../exerciseApi";
import { DashboardLayout } from "../../../components/LayoutContainers";
import { useAuth } from "../../../store/hooks";
import Footer from "../../../components/Footer";
import { Exercise } from "../../../api/quadcoachApi/domain";
import {
  ExerciseFilter,
  MAX_BEATERS,
  MAX_CHASERS,
  MAX_PERSONS,
  MAX_TIME,
  useExerciseListQuery,
} from "./useExerciseListQuery";

const defaultExerciseFilter: ExerciseFilter = {
  maxPersons: MAX_PERSONS,
  minPersons: 0,
  searchValue: "",
  tagInput: "",
  tags: [],
  materialInput: "",
  materials: [],
  minTime: 0,
  maxTime: MAX_TIME,
  minBeaters: 0,
  maxBeaters: MAX_BEATERS,
  minChasers: 0,
  maxChasers: MAX_CHASERS,
  sort: "name",
  direction: "asc",
  limit: 50,
};

const ExerciseList = () => {
  const { t } = useTranslation("ExerciseList");
  const navigate = useNavigate();

  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const { id: userId, name: userName, status: userStatus } = useAuth();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");

  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>({
    ...defaultExerciseFilter,
  });

  const onExerciseFilterValueChange =
    (exerciseFilterProperty: keyof ExerciseFilter) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setExerciseFilter({
        ...exerciseFilter,
        [exerciseFilterProperty]: event.target.value,
      });
    };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && exerciseFilter.tagInput.trim() !== "") {
      event.preventDefault();
      setExerciseFilter({
        ...exerciseFilter,
        tags: [...exerciseFilter.tags, exerciseFilter.tagInput.trim()],
        tagInput: "",
      });
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setExerciseFilter({
      ...exerciseFilter,
      tags: exerciseFilter.tags.filter((tag) => tag !== tagToDelete),
    });
  };

  const handleMaterialKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && exerciseFilter.materialInput.trim() !== "") {
      event.preventDefault();
      setExerciseFilter({
        ...exerciseFilter,
        materials: [
          ...exerciseFilter.materials,
          exerciseFilter.materialInput.trim(),
        ],
        materialInput: "",
      });
    }
  };

  const handleDeleteMaterial = (materialToDelete: string) => {
    setExerciseFilter({
      ...exerciseFilter,
      materials: exerciseFilter.materials.filter(
        (material) => material !== materialToDelete,
      ),
    });
  };

  const handleClearAllFilters = () => {
    setExerciseFilter({
      ...defaultExerciseFilter,
    });
  };

  const [getExercises] = useLazyGetExercisesQuery();
  const {
    exercises: loadedExercises,
    pagination,
    status: exerciseQueryStatus,
    isLoadingMore,
    loadMore,
  } = useExerciseListQuery({
    filter: exerciseFilter,
    getExercises,
  });
  const isExercisesError = exerciseQueryStatus === "error";
  const isExercisesLoading = exerciseQueryStatus === "loading";

  const [createExercise, { isLoading: isCreatingExercise }] =
    useAddExerciseMutation();

  const handleCreateExercise = async () => {
    if (newExerciseName.trim() === "") return;
    try {
      const baseExercise = {
        name: newExerciseName.trim(),
        materials: [],
        time_min: 0,
        beaters: 0,
        chasers: 0,
        persons: 0,
        creator: userName,
        user: userId,
        tags: [],
        description_blocks: [],
        related_to: [],
      } as Omit<Exercise, "_id">;
      const result = await createExercise(baseExercise).unwrap();
      setOpenAddDialog(false);
      setNewExerciseName("");
      navigate(`/exercises/${result._id}?edit=1`);
    } catch {
      // keep dialog open for retry or allow closing
    }
  };

  const onOpenExerciseClick = (exerciseId: string) => {
    navigate(`/exercises/${exerciseId}`);
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
                  backdropFilter: `saturate(200%) blur(${theme.functions.pxToRem(
                    30,
                  )})`,
                }
              : {
                  backgroundColor: theme.functions.rgba(
                    theme.palette.white.main,
                    0.8,
                  ),
                  boxShadow: "none",
                  backdropFilter: "none",
                }),
            transition: theme.transitions.create("all", {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.standard,
            }),
          })}
        >
          <CardHeader
            sx={(theme) => ({
              [theme.breakpoints.down("md")]: {
                alignItems: "stretch",
                flexDirection: "column",
                "& .MuiCardHeader-action": {
                  alignSelf: "auto",
                  margin: theme.spacing(1, 0, 0),
                },
              },
            })}
            title={
              <SoftTypography variant="h3">
                {t("ExerciseList:title")}
              </SoftTypography>
            }
            action={
              <SoftBox
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent={{ xs: "flex-end", md: "initial" }}
              >
                {isUpMd && (
                  <SoftInput
                    id="outlined-basic"
                    placeholder={t("ExerciseList:filter.name")}
                    value={exerciseFilter.searchValue}
                    onChange={onExerciseFilterValueChange("searchValue")}
                    sx={(theme) => ({
                      minWidth: "200px",
                      mr: 1,
                      [theme.breakpoints.up("lg")]: {
                        minWidth: "300px",
                      },
                    })}
                  />
                )}
                <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                  <InputLabel id="sort-select-label">
                    {t("ExerciseList:filter.sort.name")}
                  </InputLabel>
                  <Select
                    labelId="sort-select-label"
                    value={exerciseFilter.sort}
                    label={t("ExerciseList:filter.sort.name")}
                    onChange={(event) => {
                      setExerciseFilter({
                        ...exerciseFilter,
                        sort: event.target.value as
                          | "name"
                          | "duration"
                          | "persons"
                          | "created"
                          | "updated",
                      });
                    }}
                  >
                    <MenuItem value="name">
                      {t("ExerciseList:filter.sort.by_name")}
                    </MenuItem>
                    <MenuItem value="duration">
                      {t("ExerciseList:filter.sort.by_timeInMinutes")}
                    </MenuItem>
                    <MenuItem value="persons">
                      {t("ExerciseList:filter.sort.by_persons")}
                    </MenuItem>
                    <MenuItem value="created">
                      {t("ExerciseList:filter.sort.by_createdAt")}
                    </MenuItem>
                    <MenuItem value="updated">
                      {t("ExerciseList:filter.sort.by_updatedAt")}
                    </MenuItem>
                  </Select>
                </FormControl>
                <ToggleButton
                  value={exerciseFilter.direction}
                  selected={exerciseFilter.direction === "desc"}
                  onChange={() => {
                    setExerciseFilter({
                      ...exerciseFilter,
                      direction:
                        exerciseFilter.direction === "asc" ? "desc" : "asc",
                    });
                  }}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  <SortIcon />
                </ToggleButton>
                <ToggleButton
                  value={filterAnchorEl ? "shown" : "hide"}
                  selected={Boolean(filterAnchorEl)}
                  onClick={(e) => {
                    setFilterAnchorEl(filterAnchorEl ? null : e.currentTarget);
                  }}
                >
                  <FilterAltIcon />
                </ToggleButton>
              </SoftBox>
            }
          />
          {!isUpMd && (
            <SoftBox display="flex" alignItems="center" sx={{ pb: 2, px: 2 }}>
              <SoftInput
                id="outlined-basic"
                placeholder={t("ExerciseList:filter.name")}
                value={exerciseFilter.searchValue}
                onChange={onExerciseFilterValueChange("searchValue")}
              />
            </SoftBox>
          )}
          <Popover
            open={Boolean(filterAnchorEl)}
            anchorEl={filterAnchorEl}
            onClose={() => setFilterAnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            slotProps={{
              paper: {
                sx: {
                  backgroundColor: "background.paper",
                  boxShadow: 3,
                },
              },
            }}
          >
            <SoftBox sx={{ p: 2, minWidth: 320, maxWidth: 400 }}>
              <SoftBox display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
                <Button
                  startIcon={<ClearIcon />}
                  onClick={handleClearAllFilters}
                  size="small"
                  color="secondary"
                >
                  {t("ExerciseList:filter.clear")}
                </Button>
              </SoftBox>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <SoftTypography variant="body2">
                    {t("ExerciseList:filter.persons.titleWithNumbers", {
                      minValue: exerciseFilter.minPersons,
                      maxValue:
                        exerciseFilter.maxPersons === MAX_PERSONS
                          ? `${MAX_PERSONS}+`
                          : exerciseFilter.maxPersons,
                    })}
                  </SoftTypography>
                  <Slider
                    getAriaLabel={() => t("ExerciseList:filter.persons.title")}
                    value={[
                      exerciseFilter.minPersons,
                      exerciseFilter.maxPersons,
                    ]}
                    onChange={(_event: Event, newValue: number | number[]) => {
                      const [newMin, newMax] = newValue as number[];
                      setExerciseFilter((prev) => ({
                        ...prev,
                        maxPersons: newMax,
                        minPersons: newMin,
                      }));
                    }}
                    valueLabelDisplay="auto"
                    getAriaValueText={(value: number) => value.toString()}
                    max={MAX_PERSONS}
                    min={0}
                  />
                </Grid>

                <Grid item xs={12}>
                  <SoftTypography variant="body2">
                    {t("ExerciseList:filter.timeInMinutes.titleWithNumbers", {
                      minValue: exerciseFilter.minTime,
                      maxValue:
                        exerciseFilter.maxTime === MAX_TIME
                          ? `${MAX_TIME}+`
                          : exerciseFilter.maxTime,
                    })}
                  </SoftTypography>
                  <Slider
                    getAriaLabel={() => "Exercise Duration"}
                    value={[exerciseFilter.minTime, exerciseFilter.maxTime]}
                    onChange={(_event: Event, newValue: number | number[]) => {
                      const [newMin, newMax] = newValue as number[];
                      setExerciseFilter({
                        ...exerciseFilter,
                        minTime: newMin,
                        maxTime: newMax,
                      });
                    }}
                    valueLabelDisplay="auto"
                    getAriaValueText={(value: number) => `${value} minutes`}
                    max={MAX_TIME}
                    min={0}
                  />
                </Grid>

                <Grid item xs={12}>
                  <SoftTypography variant="body2">
                    {t("ExerciseList:filter.beaters.titleWithNumbers", {
                      minValue: exerciseFilter.minBeaters,
                      maxValue:
                        exerciseFilter.maxBeaters === MAX_BEATERS
                          ? `${MAX_BEATERS}+`
                          : exerciseFilter.maxBeaters,
                    })}
                  </SoftTypography>
                  <Slider
                    getAriaLabel={() => "Number of Beaters"}
                    value={[
                      exerciseFilter.minBeaters,
                      exerciseFilter.maxBeaters,
                    ]}
                    onChange={(_event: Event, newValue: number | number[]) => {
                      const [newMin, newMax] = newValue as number[];
                      setExerciseFilter({
                        ...exerciseFilter,
                        minBeaters: newMin,
                        maxBeaters: newMax,
                      });
                    }}
                    valueLabelDisplay="auto"
                    getAriaValueText={(value: number) => value.toString()}
                    max={MAX_BEATERS}
                    min={0}
                  />
                </Grid>

                <Grid item xs={12}>
                  <SoftTypography variant="body2">
                    {t("ExerciseList:filter.chasers.titleWithNumbers", {
                      minValue: exerciseFilter.minChasers,
                      maxValue:
                        exerciseFilter.maxChasers === MAX_CHASERS
                          ? `${MAX_CHASERS}+`
                          : exerciseFilter.maxChasers,
                    })}
                  </SoftTypography>
                  <Slider
                    getAriaLabel={() => "Number of Chasers"}
                    value={[
                      exerciseFilter.minChasers,
                      exerciseFilter.maxChasers,
                    ]}
                    onChange={(_event: Event, newValue: number | number[]) => {
                      const [newMin, newMax] = newValue as number[];
                      setExerciseFilter({
                        ...exerciseFilter,
                        minChasers: newMin,
                        maxChasers: newMax,
                      });
                    }}
                    valueLabelDisplay="auto"
                    getAriaValueText={(value: number) => value.toString()}
                    max={MAX_CHASERS}
                    min={0}
                  />
                </Grid>

                <Grid item xs={12}>
                  <SoftTypography variant="body2" sx={{ mb: 1 }}>
                    {t("ExerciseList:filter.tags.title")}
                  </SoftTypography>
                  <SoftInput
                    id="tags-filter"
                    placeholder={t("ExerciseList:filter.tags.placeholder")}
                    value={exerciseFilter.tagInput}
                    onChange={onExerciseFilterValueChange("tagInput")}
                    onKeyDown={handleTagKeyDown}
                    sx={{ width: "100%" }}
                    endAdornment={
                      <InputAdornment position="end">
                        <KeyboardReturnIcon
                          sx={{
                            fontSize: 20,
                            opacity: exerciseFilter.tagInput != "" ? 1 : 0.4,
                          }}
                        />
                      </InputAdornment>
                    }
                  />
                  <SoftBox
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                  >
                    {exerciseFilter.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleDeleteTag(tag)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </SoftBox>
                </Grid>

                <Grid item xs={12}>
                  <SoftTypography variant="body2" sx={{ mb: 1 }}>
                    {t("ExerciseList:filter.materials.title")}
                  </SoftTypography>
                  <SoftInput
                    id="materials-filter"
                    placeholder={t("ExerciseList:filter.materials.placeholder")}
                    value={exerciseFilter.materialInput}
                    onChange={onExerciseFilterValueChange("materialInput")}
                    onKeyDown={handleMaterialKeyDown}
                    sx={{ width: "100%" }}
                    endAdornment={
                      <InputAdornment position="end">
                        <KeyboardReturnIcon
                          sx={{
                            fontSize: 20,
                            opacity:
                              exerciseFilter.materialInput !== "" ? 1 : 0.4,
                          }}
                        />
                      </InputAdornment>
                    }
                  />
                  <SoftBox
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                  >
                    {exerciseFilter.materials.map((material) => (
                      <Chip
                        key={material}
                        label={material}
                        onDelete={() => handleDeleteMaterial(material)}
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </SoftBox>
                </Grid>
              </Grid>
            </SoftBox>
          </Popover>
        </Card>
      )}
      showScrollToTopButton={(scrollTrigger) => scrollTrigger && isUpMd}
    >
      {(scrollTrigger) => (
        <>
          <SoftBox sx={{ mt: 2, display: "flex" }}>
            {isUpMd && userStatus != null && (
              <SoftButton
                startIcon={<AddIcon />}
                color="secondary"
                onClick={() => setOpenAddDialog(true)}
              >
                {t("ExerciseList:addExercise")}
              </SoftButton>
            )}
            {userStatus != null && (
              <Dialog
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                fullWidth
                maxWidth="xs"
              >
                <DialogTitle>
                  {t("ExerciseList:addExerciseDialog.title")}
                </DialogTitle>
                <DialogContent>
                  <SoftInput
                    autoFocus
                    margin="dense"
                    placeholder={t("ExerciseList:addExerciseDialog.nameLabel")}
                    type="text"
                    size="small"
                    fullWidth
                    value={newExerciseName}
                    onChange={(e) => setNewExerciseName(e.target.value)}
                    disabled={isCreatingExercise}
                  />
                </DialogContent>
                <DialogActions>
                  <SoftButton
                    startIcon={<CloseIcon />}
                    onClick={() => setOpenAddDialog(false)}
                    color="secondary"
                    disabled={isCreatingExercise}
                  >
                    {t("ExerciseList:addExerciseDialog.cancel")}
                  </SoftButton>
                  <SoftButton
                    onClick={handleCreateExercise}
                    disabled={
                      isCreatingExercise || newExerciseName.trim() === ""
                    }
                    color="primary"
                    variant="contained"
                  >
                    {isCreatingExercise && (
                      <CircularProgress size={18} sx={{ mr: 1 }} />
                    )}
                    {t("ExerciseList:addExerciseDialog.add")}
                  </SoftButton>
                </DialogActions>
              </Dialog>
            )}
          </SoftBox>
          {isExercisesError && (
            <Alert color="error" sx={{ mt: 2 }}>
              {t("ExerciseList:errorLoadingExercises")}
            </Alert>
          )}
          {!isExercisesError && (
            <>
              <SoftBox sx={{ mt: 2, flexGrow: 1, overflowY: "auto", p: 2 }}>
                <ExercisesCardView
                  isExercisesLoading={isExercisesLoading}
                  onOpenExerciseClick={onOpenExerciseClick}
                  exercises={loadedExercises}
                  scrollTrigger={scrollTrigger}
                  onOpenAddExerciseClick={() => {
                    setOpenAddDialog(true);
                  }}
                />
              </SoftBox>
              {pagination && pagination.page < pagination.pages && (
                  <SoftBox
                    display="flex"
                    justifyContent="center"
                    sx={{ mt: 2, mb: 2 }}
                  >
                    <SoftButton
                      onClick={loadMore}
                      disabled={isLoadingMore}
                    >
                      {t("ExerciseList:loadMore")}
                    </SoftButton>
                  </SoftBox>
                )}
            </>
          )}
          <Footer />
        </>
      )}
    </DashboardLayout>
  );
};

export default ExerciseList;
