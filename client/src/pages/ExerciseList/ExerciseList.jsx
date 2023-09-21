import React, { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { Container, Grid, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom"
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack';
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import { SoftInput } from "../../components";
const ExerciseList = () => {
    const location = useLocation().pathname;
    const isDashboard = location === "/"
    const [exercises, setExercises] = useState([])
    const [exerciseSearchValue, setExerciseSearchValue] = useState("")

    useUpdateBreadcrumbs(isDashboard ? "Dashboard" : "Übungen", [])

    useEffect(() => {
        const getExercises = async (searchString) => {
            // refactor api, normaly we would use same endpoint and just add a queryparameter
            // /api/exercises => all, api/exercises?search=MySearchValue
            let searchPath = "/api/exercises"
            if (searchString && searchString !== "") {
                searchPath = `/api/search/${searchString}`
            }

            let result = await fetch(searchPath)
            result = await result.json()

            setExercises(result ? result : [])
        }

        getExercises(exerciseSearchValue)
    }, [exerciseSearchValue])
    const navigate = useNavigate()

    const handleRowClick = (
        params, // GridRowParams
        event, // MuiEvent<React.MouseEvent<HTMLElement>>
        details, // GridCallbackDetails
    ) => {
        navigate(`/exercises/${params.id}`)
    };
    const columns2 = [
        {
            field: 'name',
            headerName: 'Name',
            editable: false,
            hideable: false,
        },
        {
            field: 'persons',
            headerName: 'Persons',
            type: 'number',
            editable: false,
        },
        {
            field: 'tags',
            headerName: 'Tags',
            editable: false,

        },
    ];

    console.log(exercises)
    return (
        <Container fixed>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h3">Exercise List</Typography>
                </Grid>
                <Grid item xs={12}>
                    <SoftInput
                        id="outlined-basic"
                        placeholder="Search Exercise"
                        variant="outlined"
                        value={exerciseSearchValue}
                        onChange={(event) => setExerciseSearchValue(event.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sx={{ height: "400px" }}>
                    <DataGrid getRowId={(row) => row._id}
                        rows={exercises}
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
        </Container>
    )
}

export default ExerciseList
