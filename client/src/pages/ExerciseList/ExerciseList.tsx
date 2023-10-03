import React, { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { Container, Grid, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom"
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack';
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import { SoftTypography, SoftInput, SoftButton } from "../../components";
import { Collapsible } from "../../components";
import { Chip } from "@mui/material"
const ExerciseList = () => {
    const location = useLocation().pathname;
    const isDashboard = location === "/"
    const [exercises, setExercises] = useState([])
    const [exerciseSearchValue, setExerciseSearchValue] = useState("")
    const [filterMinPersons, setFilterMinPersons] = useState(0)
    const [filterMaxPersons, setFilterMaxPersons] = useState(999)
    const [filterTagString, setFilterTagString] = useState("")

    useUpdateBreadcrumbs(isDashboard ? "Dashboard" : "Exercises", [])
    
    const getExercises = async (searchString) => {

        let searchPath = `/api/exercises?name[regex]=${searchString}&name[options]=i&persons[gte]=${filterMinPersons}&persons[lte]=${filterMaxPersons}&tags[regex]=${filterTagString}`
        // let searchPath = `/api/exercises?name[regex]=${searchString}`

        let result = await fetch(searchPath)
        result = await result.json()

        setExercises(result ? result : [])
    }

    useEffect(() => {
        

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
            flex: 2,
        },
        {
            field: 'persons',
            headerName: 'Persons',
            type: 'number',
            editable: false,
            flex: 1,
        },
        {
            field: 'tags',
            headerName: 'Tags',
            editable: false,
            flex: 3,
            renderCell: (params) => {
                if(params.value.length >0 && params.value[0] != ""){
                    return(
                        params.value.map((el) => 
                            {return <Chip label={el} sx={{margin: "1px"}} variant={"outlined"} />;}
                        )
                    )
                }            
              }
        },
    ];

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
                    value={exerciseSearchValue}
                    onChange={(event) => setExerciseSearchValue(event.target.value)}
                    fullWidth
                />
            </Grid>
            <Grid item xs={12}>
                <Collapsible label="Filter">
                    <Grid container spacing={2}>
                        <Grid item xs = {6} >
                            <SoftTypography variant="body2">Persons</SoftTypography>
                            <SoftInput
                                type="number"
                                inputProps={{ min: 0, step: "1" }}
                                id="outlined-basic"
                                placeholder="min"
                                variant="outlined"
                                value={filterMinPersons}
                                onChange={(event) => setFilterMinPersons(event.target.value)}

                            />
                            <SoftInput
                                type="number"
                                inputProps={{ min: 0, step: "1" }}
                                id="outlined-basic"
                                placeholder="max"
                                variant="outlined"
                                value={filterMaxPersons}
                                onChange={(event) => setFilterMaxPersons(event.target.value)}
                            />

                        </Grid>
                        <Grid item xs = {6} >
                            <SoftTypography variant="body2">Tags</SoftTypography>
                            <SoftInput
                                id="outlined-basic"
                                placeholder="search Tag"
                                variant="outlined"
                                value={filterTagString}
                                onChange={(event) => setFilterTagString(event.target.value)}
                            />
                        </Grid>
                        <Grid item xs = {6} >
                            <SoftButton
                                onClick={getExercises(exerciseSearchValue)}
                                color="primary"
                                sx={{ marginRight: 1 }}
                            >
                                Apply Filter
                            </SoftButton>
                        </Grid>
                    </Grid>
                </Collapsible>
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
    )
}

export default ExerciseList
