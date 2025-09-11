import "./translations";
import {
  ChangeEvent,
  useEffect,
  useState,
  useCallback,
  KeyboardEvent,
} from "react";
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Collapse,
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
import ClearIcon from "@mui/icons-material/Clear";
import SortIcon from "@mui/icons-material/Sort";
import { useLazyGetExercisesQuery } from "../../exerciseApi";
import { DashboardLayout } from "../../../components/LayoutContainers";
import { useAuth } from "../../../store/hooks";
import Footer from "../../../components/Footer";
import debounce from "lodash/debounce";
import { Exercise } from "../../../api/quadcoachApi/domain";

const maxPersons = 20; // Maximum number of persons for filtering
const maxTime = 60; // Maximum time in minutes
const maxChasers = 10; // Maximum number of chasers
const maxBeaters = 10; // Maximum number of beaters

enum ViewType {
  List = "List",
  Cards = "Cards",
}

type ExerciseFilter = {
  searchValue: string;
  minPersons: number;
  maxPersons: number;
  tagRegex: string;
  tagList: string[];
  materialRegex: string;
  materialList: string[];
  minTime: number;
  maxTime: number;
  minBeaters: number;
  maxBeaters: number;
  minChasers: number;
  maxChasers: number;
  sortBy: "name" | "time" | "persons" | "created" | "updated";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
};

const defaultExerciseFilter: ExerciseFilter = {
  maxPersons: maxPersons,
  minPersons: 0,
  searchValue: "",
  tagRegex: "",
  tagList: [],
  materialRegex: "",
  materialList: [],
  minTime: 0,
  maxTime: maxTime,
  minBeaters: 0,
  maxBeaters: maxBeaters,
  minChasers: 0,
  maxChasers: maxChasers,
  sortBy: "name",
  sortOrder: "asc",
  page: 1,
  limit: 50,
};

const ExerciseList = () => {
  const { t } = useTranslation("ExerciseList");
  const navigate = useNavigate();

  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [viewType, setViewType] = useState<ViewType>(ViewType.Cards);
  const { status: userStatus } = useAuth();
  const [loadedExercises, setLoadedExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (isUpMd) return;
    setViewType(ViewType.Cards);
  }, [isUpMd]);

  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>({
    ...defaultExerciseFilter,
  });

  const onExerciseFilterValueChange =
    (exerciseFilterProperty: keyof ExerciseFilter) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setLoadedExercises([]);
      setExerciseFilter({
        ...exerciseFilter,
        [exerciseFilterProperty]: event.target.value,
        page: 1,
      });
    };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && exerciseFilter.tagRegex.trim() !== "") {
      event.preventDefault();
      setLoadedExercises([]);
      setExerciseFilter({
        ...exerciseFilter,
        tagList: [...exerciseFilter.tagList, exerciseFilter.tagRegex.trim()],
        tagRegex: "",
        page: 1,
      });
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setLoadedExercises([]);
    setExerciseFilter({
      ...exerciseFilter,
      tagList: exerciseFilter.tagList.filter((tag) => tag !== tagToDelete),
      page: 1,
    });
  };

  const handleMaterialKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && exerciseFilter.materialRegex.trim() !== "") {
      event.preventDefault();
      setLoadedExercises([]);
      setExerciseFilter({
        ...exerciseFilter,
        materialList: [
          ...exerciseFilter.materialList,
          exerciseFilter.materialRegex.trim(),
        ],
        materialRegex: "",
        page: 1,
      });
    }
  };

  const handleDeleteMaterial = (materialToDelete: string) => {
    setLoadedExercises([]);
    setExerciseFilter({
      ...exerciseFilter,
      materialList: exerciseFilter.materialList.filter(
        (material) => material !== materialToDelete,
      ),
      page: 1,
    });
  };

  const handleClearAllFilters = () => {
    setLoadedExercises([]);
    setExerciseFilter({
      ...defaultExerciseFilter,
    });
  };

  const [
    getExercises,
    {
      data: exercisesData,
      isError: isExercisesError,
      isLoading: isExercisesLoading,
    },
  ] = useLazyGetExercisesQuery();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedGetExercises = useCallback(
    debounce((filter: ExerciseFilter) => {
      getExercises({
        // Treat selecting the UI maximum as "no upper bound" (infinite)
        maxPersons:
          filter.maxPersons === maxPersons ? undefined : filter.maxPersons,
        minPersons: filter.minPersons,
        nameRegex: filter.searchValue,
        tagRegex: filter.tagRegex,
        tagList: filter.tagList,
        materialRegex: filter.materialRegex,
        materialList: filter.materialList,
        minTime: filter.minTime,
        maxTime: filter.maxTime === maxTime ? undefined : filter.maxTime,
        minBeaters: filter.minBeaters,
        maxBeaters:
          filter.maxBeaters === maxBeaters ? undefined : filter.maxBeaters,
        minChasers: filter.minChasers,
        maxChasers:
          filter.maxChasers === maxChasers ? undefined : filter.maxChasers,
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
        page: filter.page,
        limit: filter.limit,
      });
    }, 500),
    [getExercises],
  );

  useEffect(() => {
    debouncedGetExercises(exerciseFilter);

    return () => {
      debouncedGetExercises.cancel();
    };
  }, [exerciseFilter, debouncedGetExercises]);

  useEffect(() => {
    if (exercisesData?.exercises) {
      setLoadedExercises((prev) => {
        const newExerciseIds = new Set(
          exercisesData.exercises.map((e) => e._id),
        );
        const filteredPrev = prev.filter((e) => !newExerciseIds.has(e._id));
        return [...filteredPrev, ...exercisesData.exercises];
      });
    }
  }, [exercisesData]);

  const onOpenExerciseClick = (exerciseId: string) => {
    navigate(`/exercises/${exerciseId}`);
  };

  // Load more function
  const loadMore = useCallback(() => {
    if (exercisesData && exerciseFilter.page < exercisesData.pagination.pages) {
      setExerciseFilter((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [exercisesData, exerciseFilter.page]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      setLoadedExercises([]); // Clear exercises when component unmounts
    };
  }, []);

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
            title={
              <SoftTypography variant="h3">
                {t("ExerciseList:title")}
              </SoftTypography>
            }
            action={
              <SoftBox display="flex" flexDirection="row" alignItems="center">
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
                  <InputLabel id="sort-select-label">Sort by</InputLabel>
                  <Select
                    labelId="sort-select-label"
                    value={exerciseFilter.sortBy}
                    label="Sort by"
                    onChange={(event) => {
                      setLoadedExercises([]);
                      setExerciseFilter({
                        ...exerciseFilter,
                        sortBy: event.target.value as
                          | "name"
                          | "time"
                          | "persons"
                          | "created"
                          | "updated",
                        page: 1,
                      });
                    }}
                  >
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="time">Duration</MenuItem>
                    <MenuItem value="persons">Persons</MenuItem>
                    <MenuItem value="created">Created</MenuItem>
                    <MenuItem value="updated">Updated</MenuItem>
                  </Select>
                </FormControl>
                <ToggleButton
                  value={exerciseFilter.sortOrder}
                  selected={exerciseFilter.sortOrder === "desc"}
                  onChange={() => {
                    setLoadedExercises([]);
                    setExerciseFilter({
                      ...exerciseFilter,
                      sortOrder:
                        exerciseFilter.sortOrder === "asc" ? "desc" : "asc",
                      page: 1,
                    });
                  }}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  <SortIcon />
                </ToggleButton>
                <ToggleButton
                  value={showFilters ? "shown" : "hide"}
                  selected={showFilters}
                  onChange={() => {
                    setShowFilters(!showFilters);
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
          <Collapse in={showFilters} timeout="auto" unmountOnExit>
            <CardContent sx={{ p: 2 }}>
              <SoftBox display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
                <Button
                  startIcon={<ClearIcon />}
                  onClick={handleClearAllFilters}
                  size="small"
                  color="secondary"
                >
                  Clear All Filters
                </Button>
              </SoftBox>
              <Grid container spacing={3} sx={{ pl: 2, width: "100%" }}>
                {/* Persons Filter */}
                <Grid item xs={12} md={6}>
                  <SoftTypography variant="body2">
                    {t("ExerciseList:filter.persons.titleWithNumbers", {
                      minValue: exerciseFilter.minPersons,
                      maxValue:
                        exerciseFilter.maxPersons === maxPersons
                          ? `${maxPersons}+`
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
                      setLoadedExercises([]);
                      setExerciseFilter((prev) => ({
                        ...prev,
                        maxPersons: newMax,
                        minPersons: newMin,
                        page: 1,
                      }));
                    }}
                    valueLabelDisplay="auto"
                    getAriaValueText={(value: number) => value.toString()}
                    max={maxPersons}
                    min={0}
                  />
                </Grid>

                {/* Time Duration Filter */}
                <Grid item xs={12} md={6}>
                  <SoftTypography variant="body2">
                    Duration (min): {exerciseFilter.minTime} -{" "}
                    {exerciseFilter.maxTime === maxTime
                      ? `${maxTime}+`
                      : exerciseFilter.maxTime}
                  </SoftTypography>
                  <Slider
                    getAriaLabel={() => "Exercise Duration"}
                    value={[exerciseFilter.minTime, exerciseFilter.maxTime]}
                    onChange={(_event: Event, newValue: number | number[]) => {
                      const [newMin, newMax] = newValue as number[];
                      setLoadedExercises([]);
                      setExerciseFilter({
                        ...exerciseFilter,
                        minTime: newMin,
                        maxTime: newMax,
                        page: 1,
                      });
                    }}
                    valueLabelDisplay="auto"
                    getAriaValueText={(value: number) => `${value} minutes`}
                    max={maxTime}
                    min={0}
                  />
                </Grid>

                {/* Beaters Filter */}
                <Grid item xs={12} md={6}>
                  <SoftTypography variant="body2">
                    Beaters: {exerciseFilter.minBeaters} -{" "}
                    {exerciseFilter.maxBeaters === maxBeaters
                      ? `${maxBeaters}+`
                      : exerciseFilter.maxBeaters}
                  </SoftTypography>
                  <Slider
                    getAriaLabel={() => "Number of Beaters"}
                    value={[
                      exerciseFilter.minBeaters,
                      exerciseFilter.maxBeaters,
                    ]}
                    onChange={(_event: Event, newValue: number | number[]) => {
                      const [newMin, newMax] = newValue as number[];
                      setLoadedExercises([]);
                      setExerciseFilter({
                        ...exerciseFilter,
                        minBeaters: newMin,
                        maxBeaters: newMax,
                        page: 1,
                      });
                    }}
                    valueLabelDisplay="auto"
                    getAriaValueText={(value: number) => value.toString()}
                    max={maxBeaters}
                    min={0}
                  />
                </Grid>

                {/* Chasers Filter */}
                <Grid item xs={12} md={6}>
                  <SoftTypography variant="body2">
                    Chasers: {exerciseFilter.minChasers} -{" "}
                    {exerciseFilter.maxChasers === maxChasers
                      ? `${maxChasers}+`
                      : exerciseFilter.maxChasers}
                  </SoftTypography>
                  <Slider
                    getAriaLabel={() => "Number of Chasers"}
                    value={[
                      exerciseFilter.minChasers,
                      exerciseFilter.maxChasers,
                    ]}
                    onChange={(_event: Event, newValue: number | number[]) => {
                      const [newMin, newMax] = newValue as number[];
                      setLoadedExercises([]);
                      setExerciseFilter({
                        ...exerciseFilter,
                        minChasers: newMin,
                        maxChasers: newMax,
                        page: 1,
                      });
                    }}
                    valueLabelDisplay="auto"
                    getAriaValueText={(value: number) => value.toString()}
                    max={maxChasers}
                    min={0}
                  />
                </Grid>

                {/* Tags Filter */}
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{ display: "flex", flexDirection: "column" }}
                >
                  <SoftTypography variant="body2">
                    {t("ExerciseList:filter.tags.title")}
                  </SoftTypography>
                  <SoftInput
                    id="tags-filter"
                    placeholder={t("ExerciseList:filter.tags.placeholder")}
                    value={exerciseFilter.tagRegex}
                    onChange={onExerciseFilterValueChange("tagRegex")}
                    onKeyDown={handleTagKeyDown}
                    sx={{ width: "100%" }}
                    endAdornment={
                      <InputAdornment position="end">
                        <KeyboardReturnIcon
                          sx={{
                            fontSize: 20,
                            opacity: exerciseFilter.tagRegex != "" ? 1 : 0.4,
                          }}
                        />
                      </InputAdornment>
                    }
                  />
                  <SoftBox
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                  >
                    {exerciseFilter.tagList.map((tag) => (
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

                {/* Materials Filter */}
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{ display: "flex", flexDirection: "column" }}
                >
                  <SoftTypography variant="body2">Materials</SoftTypography>
                  <SoftInput
                    id="materials-filter"
                    placeholder="Add material (press Enter)"
                    value={exerciseFilter.materialRegex}
                    onChange={onExerciseFilterValueChange("materialRegex")}
                    onKeyDown={handleMaterialKeyDown}
                    sx={{ width: "100%" }}
                    endAdornment={
                      <InputAdornment position="end">
                        <KeyboardReturnIcon
                          sx={{
                            fontSize: 20,
                            opacity:
                              exerciseFilter.materialRegex !== "" ? 1 : 0.4,
                          }}
                        />
                      </InputAdornment>
                    }
                  />
                  <SoftBox
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                  >
                    {exerciseFilter.materialList.map((material) => (
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
            </CardContent>
          </Collapse>
        </Card>
      )}
      showScrollToTopButton={(scrollTrigger) => scrollTrigger && isUpMd}
    >
      {(scrollTrigger) => (
        <>
          {isUpMd && (
            <SoftBox sx={{ mt: 2, display: "flex" }}>
              {userStatus != null && (
                <SoftButton
                  startIcon={<AddIcon />}
                  color="secondary"
                  href="/exercises/add"
                >
                  {t("ExerciseList:addExercise")}
                </SoftButton>
              )}
            </SoftBox>
          )}
          {isExercisesError && (
            <Alert color="error" sx={{ mt: 2 }}>
              {t("ExerciseList:errorLoadingExercises")}
            </Alert>
          )}
          {!isExercisesError && viewType === ViewType.Cards && (
            <>
              <SoftBox sx={{ mt: 2, flexGrow: 1, overflowY: "auto", p: 2 }}>
                <ExercisesCardView
                  isExercisesLoading={isExercisesLoading}
                  onOpenExerciseClick={onOpenExerciseClick}
                  exercises={loadedExercises}
                  scrollTrigger={scrollTrigger}
                />
              </SoftBox>
              {exercisesData &&
                exerciseFilter.page < exercisesData.pagination.pages && (
                  <SoftBox
                    display="flex"
                    justifyContent="center"
                    sx={{ mt: 2, mb: 2 }}
                  >
                    <SoftButton
                      onClick={loadMore}
                      disabled={isExercisesLoading}
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
