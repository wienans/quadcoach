import "./translations";
import {
  ChangeEvent,
  MouseEvent,
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
  ToggleButtonGroup,
  useMediaQuery,
  Chip,
  InputAdornment,
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
import GridViewIcon from "@mui/icons-material/GridView";
import ListIcon from "@mui/icons-material/List";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import ExercisesListView from "./listView/ExercisesListView";
import ExercisesCardView from "./cardView/ExercisesCardView";
import AddIcon from "@mui/icons-material/Add";
import { useLazyGetExercisesQuery } from "../../exerciseApi";
import { DashboardLayout } from "../../../components/LayoutContainers";
import { useAuth } from "../../../store/hooks";
import Footer from "../../../components/Footer";
import debounce from "lodash/debounce";
import { Exercise } from "../../../api/quadcoachApi/domain";
const maxPersons = 100;

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
  page: number;
  limit: number;
};

const defaultExerciseFilter: ExerciseFilter = {
  maxPersons: maxPersons,
  minPersons: 0,
  searchValue: "",
  tagRegex: "",
  tagList: [],
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
    page: 1,
    limit: 50,
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

  const [
    getExercises,
    {
      data: exercisesData,
      isError: isExercisesError,
      isLoading: isExercisesLoading,
    },
  ] = useLazyGetExercisesQuery();

  const debouncedGetExercises = useCallback(
    debounce((filter: ExerciseFilter) => {
      getExercises({
        maxPersons: filter.maxPersons,
        minPersons: filter.minPersons,
        nameRegex: filter.searchValue,
        tagRegex: filter.tagRegex,
        tagList: filter.tagList,
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
      setLoadedExercises((prev) => [...prev, ...exercisesData.exercises]);
    }
  }, [exercisesData]);

  const onOpenExerciseClick = (exerciseId: string) => {
    navigate(`/exercises/${exerciseId}`);
  };

  const onViewTypeChange = (
    _event: MouseEvent<HTMLElement>,
    newViewType: ViewType,
  ) => {
    setViewType(newViewType);
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
              <Grid container spacing={2} sx={{ pl: 2, width: "100%" }}>
                <Grid item xs={12} md={6}>
                  <SoftTypography variant="body2">
                    {t("ExerciseList:filter.persons.titleWithNumbers", {
                      minValue: exerciseFilter.minPersons,
                      maxValue: exerciseFilter.maxPersons,
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
                      setExerciseFilter({
                        ...exerciseFilter,
                        maxPersons: newMax,
                        minPersons: newMin,
                      });
                    }}
                    valueLabelDisplay="auto"
                    getAriaValueText={(value: number) => value.toString()}
                    max={maxPersons}
                    min={0}
                  />
                </Grid>
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
                    id="outlined-basic"
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
              <ToggleButtonGroup
                value={viewType}
                exclusive
                onChange={onViewTypeChange}
                aria-label="text alignment"
                sx={{ marginLeft: "auto" }}
              >
                <ToggleButton value={ViewType.Cards} aria-label="Kartenansicht">
                  <GridViewIcon />
                </ToggleButton>
                <ToggleButton value={ViewType.List} aria-label="Listenansicht">
                  <ListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </SoftBox>
          )}
          {isExercisesError && (
            <Alert color="error" sx={{ mt: 2 }}>
              {t("ExerciseList:errorLoadingExercises")}
            </Alert>
          )}
          {!isExercisesError && viewType === ViewType.List && (
            <SoftBox sx={{ mt: 2 }}>
              <ExercisesListView
                isExercisesLoading={isExercisesLoading}
                onOpenExerciseClick={onOpenExerciseClick}
                exercises={loadedExercises}
              />
            </SoftBox>
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
