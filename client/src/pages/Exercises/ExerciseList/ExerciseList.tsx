import "./translations";
import { ChangeEvent, MouseEvent, useEffect, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Grid,
  IconButton,
  Slider,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useScrollTrigger,
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
import ExercisesListView from "./listView/ExercisesListView";
import ExercisesCardView from "./cardView/ExercisesCardView";
import AddIcon from "@mui/icons-material/Add";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import { useLazyGetExercisesQuery } from "../../exerciseApi";

const maxPersons = 100;

enum ViewType {
  List = "List",
  Cards = "Cards",
}

type ExerciseFilter = {
  searchValue: string;
  minPersons: number;
  maxPersons: number;
  tagString: string;
};

const defaultExerciseFilter: ExerciseFilter = {
  maxPersons: maxPersons,
  minPersons: 0,
  searchValue: "",
  tagString: "",
};

const ExerciseList = () => {
  const { t } = useTranslation("ExerciseList");
  const navigate = useNavigate();

  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));
  const scrollTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [viewType, setViewType] = useState<ViewType>(ViewType.Cards);

  useEffect(() => {
    if (isUpMd) return;
    setViewType(ViewType.Cards);
  }, [isUpMd]);

  const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>(
    defaultExerciseFilter,
  );

  const onExerciseFilterValueChange =
    (exerciseFilterProperty: keyof ExerciseFilter) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setExerciseFilter({
        ...exerciseFilter,
        [exerciseFilterProperty]: event.target.value,
      });
    };

  const [
    getExercises,
    {
      data: exercises,
      isError: isExercisesError,
      isLoading: isExercisesLoading,
    },
  ] = useLazyGetExercisesQuery();

  useEffect(() => {
    getExercises({
      maxPersons: defaultExerciseFilter.maxPersons,
      minPersons: defaultExerciseFilter.minPersons,
      nameRegex: defaultExerciseFilter.searchValue,
      tagString: defaultExerciseFilter.tagString,
    });
  }, [getExercises]);

  useEffect(() => {
    getExercises({
      maxPersons: exerciseFilter.maxPersons,
      minPersons: exerciseFilter.minPersons,
      nameRegex: exerciseFilter.searchValue,
      tagString: exerciseFilter.tagString,
    });
  }, [exerciseFilter.searchValue, getExercises, exerciseFilter]);

  const onOpenExerciseClick = (exerciseId: string) => {
    navigate(`/exercises/${exerciseId}`);
  };

  const onViewTypeChange = (
    _event: MouseEvent<HTMLElement>,
    newViewType: ViewType,
  ) => {
    setViewType(newViewType);
  };

  return (
    <SoftBox sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
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
                  value={[exerciseFilter.minPersons, exerciseFilter.maxPersons]}
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
                  value={exerciseFilter.tagString}
                  onChange={onExerciseFilterValueChange("tagString")}
                  sx={{ width: "100%" }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Collapse>
      </Card>
      {isUpMd && (
        <SoftBox sx={{ mt: 2, display: "flex" }}>
          <SoftButton
            startIcon={<AddIcon />}
            color="secondary"
            href="/exercises/add"
          >
            {t("ExerciseList:addExercise")}
          </SoftButton>
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
          {" "}
          {t("ExerciseList:errorLoadingExercises")}
        </Alert>
      )}
      {!isExercisesError && viewType === ViewType.List && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <ExercisesListView
              isExercisesLoading={isExercisesLoading}
              onOpenExerciseClick={onOpenExerciseClick}
              exercises={exercises}
            />
          </CardContent>
        </Card>
      )}
      {!isExercisesError && viewType === ViewType.Cards && (
        <>
          <SoftBox sx={{ mt: 2, flexGrow: 1, overflowY: "auto", p: 2 }}>
            <ExercisesCardView
              isExercisesLoading={isExercisesLoading}
              onOpenExerciseClick={onOpenExerciseClick}
              exercises={exercises}
              scrollTrigger={scrollTrigger}
            />
          </SoftBox>
          {scrollTrigger && isUpMd && (
            <IconButton
              onClick={() => window.scrollTo(0, 0)}
              sx={{ position: "fixed", bottom: 16, right: 16 }}
            >
              <ArrowCircleUpIcon />
            </IconButton>
          )}
        </>
      )}
    </SoftBox>
  );
};

export default ExerciseList;
