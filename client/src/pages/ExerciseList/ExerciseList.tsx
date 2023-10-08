import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { DataGrid, GridCallbackDetails, GridColDef, GridEventLookup, MuiBaseEvent } from '@mui/x-data-grid';
import { Alert, Grid, LinearProgress, } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom"
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import { SoftTypography, SoftInput, SoftButton } from "../../components";
import { Collapsible } from "../../components";
import { Chip } from "@mui/material"
import { useLazyGetExercisesQuery } from "../exerciseApi";
import { Exercise } from "../../api/quadcoachApi/domain";

type ExerciseFilter = {
    searchValue: string;
    minPersons: number;
    maxPersons: number;
    tagString: string;
}

const defaultExerciseFilter: ExerciseFilter = {
    maxPersons: 999,
    minPersons: 0,
    searchValue: "",
    tagString: "",
};

const ExerciseList = () => {
    const location = useLocation().pathname;
    const navigate = useNavigate()

    const isDashboard = location === "/"

    const [exerciseFilter, setExerciseFilter] = useState<ExerciseFilter>(defaultExerciseFilter)

    const onExerciseFilterValueChange = (exerciseFilterProperty: keyof ExerciseFilter) => (event: ChangeEvent<HTMLInputElement>) => {
        setExerciseFilter({
            ...exerciseFilter,
            [exerciseFilterProperty]: event.target.value
        })
    }

    useUpdateBreadcrumbs(isDashboard ? "Dashboard" : "Exercises", [])

    const [getExercises, { data: exercises, isError: isExercisesError, isLoading: isExercisesLoading }] = useLazyGetExercisesQuery()

    useEffect(() => {
        getExercises({
            maxPersons: defaultExerciseFilter.maxPersons,
            minPersons: defaultExerciseFilter.minPersons,
            nameRegex: defaultExerciseFilter.searchValue,
            tagString: defaultExerciseFilter.tagString,
        });
    }, [])

    useEffect(() => {
        getExercises({
            maxPersons: exerciseFilter.maxPersons,
            minPersons: exerciseFilter.minPersons,
            nameRegex: exerciseFilter.searchValue,
            tagString: exerciseFilter.tagString,
        });
    }, [exerciseFilter.searchValue])

    const handleApplyFilterClick = () => {
        getExercises({
            maxPersons: exerciseFilter.maxPersons,
            minPersons: exerciseFilter.minPersons,
            nameRegex: exerciseFilter.searchValue,
            tagString: exerciseFilter.tagString,
        });
    }

    const handleRowClick = (
        params: GridEventLookup["rowClick"]["params"], // GridRowParams
        _event: MuiBaseEvent, // MuiEvent<React.MouseEvent<HTMLElement>>
        _details: GridCallbackDetails, // GridCallbackDetails
    ) => {
        navigate(`/exercises/${params.id}`)
    };

    const columns2: GridColDef<Exercise>[] = useMemo(() => [
        {
            field: 'name',
            headerName: 'Name',
            editable: false,
            hideable: false,
            // flex: 2,
        },
        {
            field: 'persons',
            headerName: 'Persons',
            type: 'number',
            editable: false,
            // flex: 1,
        },
        {
            field: 'tags',
            headerName: 'Tags',
            editable: false,
            // flex: 3,
            renderCell: (params) => {
                if (params.value.length > 0 && params.value[0] != "") {
                    return (
                        params.value.map((el: string) => <Chip key={el} label={el} sx={{ margin: "1px" }} variant={"outlined"} />
                        )
                    )
                }
            }
        },
    ], []);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <SoftTypography variant="h3">Exercise List</SoftTypography>
            </Grid>
            <Grid item xs={12}>
                <SoftInput
                    id="outlined-basic"
                    placeholder="Search Exercise"
                    variant="outlined"
                    value={exerciseFilter.searchValue}
                    onChange={onExerciseFilterValueChange("searchValue")}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12}>
                <Collapsible label="Filter">
                    <Grid container spacing={2}>
                        <Grid item xs={6} >
                            <SoftTypography variant="body2">Persons</SoftTypography>
                            <SoftInput
                                type="number"
                                inputProps={{ min: 0, step: "1" }}
                                id="outlined-basic"
                                placeholder="min"
                                variant="outlined"
                                value={exerciseFilter.minPersons}
                                onChange={onExerciseFilterValueChange("minPersons")}

                            />
                            <SoftInput
                                type="number"
                                inputProps={{ min: 0, step: "1" }}
                                id="outlined-basic"
                                placeholder="max"
                                variant="outlined"
                                value={exerciseFilter.maxPersons}
                                onChange={onExerciseFilterValueChange("maxPersons")}
                            />

                        </Grid>
                        <Grid item xs={6} >
                            <SoftTypography variant="body2">Tags</SoftTypography>
                            <SoftInput
                                id="outlined-basic"
                                placeholder="search Tag"
                                variant="outlined"
                                value={exerciseFilter.tagString}
                                onChange={onExerciseFilterValueChange("tagString")}
                            />
                        </Grid>
                        <Grid item xs={6} >
                            <SoftButton
                                onClick={handleApplyFilterClick}
                                color="primary"
                                sx={{ marginRight: 1 }}
                            >
                                Apply Filter
                            </SoftButton>
                        </Grid>
                    </Grid>
                </Collapsible>
            </Grid>
            {
                isExercisesError && <Grid item xs={12}>
                    <Alert color="error">
                        An error occurred while loading exercises
                    </Alert>
                </Grid>
            }
            <Grid item xs={12} sx={{ height: "400px", width: "100%" }}>
                <DataGrid
                    slots={{
                        loadingOverlay: LinearProgress
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
    )
}

export default ExerciseList
