import React, { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom"
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack';
const ExerciseList = () => {
    const [exercises, setExercises] = useState([])

    useEffect(() => {
        getExercises()
    }, [])
    const navigate = useNavigate()
    const getExercises = async () => {
        let result = await fetch("/api/exercises")
        result = await result.json()
        setExercises(result)
    }

    const searchHandle = async (event) => {
        let key = event.target.value
        if (key) {
            let result = await fetch(`/api/search/${key}`)
            result = await result.json()
            if (result) {
                setExercises(result)
            }
        } else {
            getExercises()
        }
    }
    const handleRowClick = (
        params, // GridRowParams
        event, // MuiEvent<React.MouseEvent<HTMLElement>>
        details, // GridCallbackDetails
    ) => {
        navigate("/exercise/" + params.id)
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
        <div className="exercise-list">
            <Stack spacing={2} sx={{ mt: 3 }}>
                <Typography variant="h3">Exercise List</Typography>
                <TextField id="outlined-basic" variant="outlined" placeholder="Search Exercise" onChange={searchHandle} />
                <Box sx={{ height: 400, width: '100%' }}>
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
                </Box>
            </Stack>
        </div>
    )
}

export default ExerciseList