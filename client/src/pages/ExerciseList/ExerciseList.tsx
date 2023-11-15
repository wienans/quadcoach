import "./translations";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { DataGrid, GridColDef, GridEventLookup } from "@mui/x-data-grid";
import { Alert, Grid, LinearProgress } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import { SoftTypography, SoftInput, SoftButton } from "../../components";
import { Collapsible } from "../../components";
import { Chip } from "@mui/material";
import { useLazyGetExercisesQuery } from "../exerciseApi";
import { Exercise } from "../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";

type ExerciseFilter = {
  searchValue: string;
  minPersons: number;
  maxPersons: number;
  tagString: string;
};

const defaultExerciseFilter: ExerciseFilter = {
  maxPersons: 999,
  minPersons: 0,
  searchValue: "",
  tagString: "",
};

const ExerciseList = () => {
  const { t } = useTranslation("ExerciseList");
  const location = useLocation().pathname;
  const navigate = useNavigate();

  const isDashboard = location === "/";

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

  useUpdateBreadcrumbs(
    isDashboard
      ? t("ExerciseList:dashboardBreadcrumb")
      : t("ExerciseList:dashboardBreadcrumb"),
    [],
  );

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

  const handleApplyFilterClick = () => {
    getExercises({
      maxPersons: exerciseFilter.maxPersons,
      minPersons: exerciseFilter.minPersons,
      nameRegex: exerciseFilter.searchValue,
      tagString: exerciseFilter.tagString,
    });
  };

  const handleRowClick = (
    params: GridEventLookup["rowClick"]["params"], // GridRowParams
  ) => {
    navigate(`/exercises/${params.id}`);
  };

  const columns2: GridColDef<Exercise>[] = useMemo(
    () => [
      {
        field: "name",
        headerName: t("ExerciseList:columns.name"),
        editable: false,
        hideable: false,
        flex: 2,
      },
      {
        field: "persons",
        headerName: t("ExerciseList:columns.persons"),
        type: "number",
        editable: false,
        flex: 1,
      },
      {
        field: "tags",
        headerName: t("ExerciseList:columns.tags"),
        editable: false,
        flex: 3,
        renderCell: (params) => {
          if (params.value.length > 0 && params.value[0] != "") {
            return params.value.map((el: string) => (
              <Chip
                key={el}
                label={el}
                sx={{ margin: "1px" }}
                variant={"outlined"}
              />
            ));
          }
        },
      },
    ],
    [t],
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <SoftTypography variant="h3">{t("ExerciseList:title")}</SoftTypography>
      </Grid>
      <Grid item xs={12}>
        <SoftInput
          id="outlined-basic"
          placeholder={t("ExerciseList:filter.name")}
          value={exerciseFilter.searchValue}
          onChange={onExerciseFilterValueChange("searchValue")}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Collapsible label="Filter">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <SoftTypography variant="body2">
                {t("ExerciseList:filter.persons.title")}
              </SoftTypography>
              <SoftInput
                type="number"
                inputProps={{ min: 0, step: "1" }}
                id="outlined-basic"
                placeholder={t("ExerciseList:filter.persons.min")}
                value={exerciseFilter.minPersons}
                onChange={onExerciseFilterValueChange("minPersons")}
              />
              <SoftInput
                type="number"
                inputProps={{ min: 0, step: "1" }}
                id="outlined-basic"
                placeholder={t("ExerciseList:filter.persons.max")}
                value={exerciseFilter.maxPersons}
                onChange={onExerciseFilterValueChange("maxPersons")}
              />
            </Grid>
            <Grid item xs={6}>
              <SoftTypography variant="body2">
                {t("ExerciseList:filter.tags.title")}
              </SoftTypography>
              <SoftInput
                id="outlined-basic"
                placeholder={t("ExerciseList:filter.tags.placeholder")}
                value={exerciseFilter.tagString}
                onChange={onExerciseFilterValueChange("tagString")}
              />
            </Grid>
            <Grid item xs={6}>
              <SoftButton
                onClick={handleApplyFilterClick}
                color="primary"
                sx={{ marginRight: 1 }}
              >
                {t("ExerciseList:filter.apply")}
              </SoftButton>
            </Grid>
          </Grid>
        </Collapsible>
      </Grid>
      {isExercisesError && (
        <Grid item xs={12}>
          <Alert color="error">
            {" "}
            {t("ExerciseList:errorLoadingExercises")}
          </Alert>
        </Grid>
      )}
      <Grid item xs={12} sx={{ height: "400px", width: "100%" }}>
        <DataGrid
          slots={{
            loadingOverlay: LinearProgress,
          }}
          loading={isExercisesLoading}
          getRowId={(row) => row._id}
          rows={exercises || []}
          columns={columns2}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          onRowClick={handleRowClick}
        />
      </Grid>
    </Grid>
  );
};

export default ExerciseList;
