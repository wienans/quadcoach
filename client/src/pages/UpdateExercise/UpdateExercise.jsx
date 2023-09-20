import React from "react";
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import { Container, Grid, Typography } from "@mui/material";
import { SoftButton, SoftInput, SoftTypography } from "../../components";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";

const UpdateExercise = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [video_url, setVideoUrl] = useState("");
    const [time_min, setTimeMin] = useState(0);
    const [persons, setPersons] = useState(0);
    const [materials_string, setMaterials] = useState("");
    const [tags_string, setTags] = useState("");
    const [error, setError] = useState(false)

    useUpdateBreadcrumbs(name ? `Übung ${name} bearbeiten` : "Übung bearbeiten", [{ title: "Übungen", to: "exercises" }])

    const params = useParams()

    const navigate = useNavigate()

    useEffect(() => {
        getExerciseDetails()
    }, [])

    const getExerciseDetails = async () => {
        let result = await fetch(`/api/exercise/${params.id}`)
        result = await result.json()
        console.warn(result)
        setName(result.name)
        setDescription(result.description)
        setVideoUrl(result.video_url)
        setTimeMin(result.time_min)
        setPersons(result.persons)
        setMaterials(result.materials.toString())
        setTags(result.tags.toString())
    }

    const update = async () => {
        if (!name || !description) {
            setError(true)
            return false
        }
        let materials = materials_string.replace(/\s/g, '').split(',')
        let tags = tags_string.replace(/\s/g, '').split(',')

        console.warn(JSON.stringify({ name, description, video_url, time_min, persons, materials, tags }))
        let result = await fetch(`/api/exercise/${params.id}`, {
            method: "put",
            body: JSON.stringify({ name, description, video_url, time_min, persons, materials, tags }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        result = await result.json()
        console.warn(result)
        if (result) {
            navigate("/")
        }

    }

    const deleteExercise = async () => {
        let result = await fetch(`/api/exercise/${params.id}`, {
            method: "delete",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        result = await result.json()
        if (result) {
            navigate("/")
        }
    }

    return (
        <Container fixed>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <SoftTypography variant="h3">Update Exercise</SoftTypography>
                </Grid>
                <Grid item xs={12}>
                    <SoftInput
                        error={error && !name}
                        required
                        id="outlined-basic"
                        placeholder="Name"
                        variant="outlined"
                        helperText={error && !name ? 'Enter Name' : ''}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth />
                </Grid>
                <Grid item xs={12}>
                    <SoftInput
                        error={error && !description}
                        required
                        multiline
                        id="outlined-textarea"
                        placeholder="Description"
                        variant="outlined"
                        helperText={error && !description ? 'Enter Description' : ''}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <SoftInput
                        id="outlined-basic"
                        placeholder="Video URL"
                        variant="outlined"
                        value={video_url}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <SoftInput
                        type="number"
                        inputProps={{ min: 0, step: "1" }}
                        id="outlined-basic"
                        placeholder="Suggested Time"
                        variant="outlined"
                        InputProps={{ endAdornment: <InputAdornment position="end">minutes</InputAdornment>, }}
                        value={time_min}
                        onChange={(e) => setTimeMin(e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <SoftInput
                        type="number"
                        inputProps={{ min: 0, step: "1" }}
                        id="outlined-basic"
                        placeholder="Person Number"
                        variant="outlined"
                        value={persons}
                        onChange={(e) => setPersons(e.target.value)}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <SoftInput
                        multiline
                        id="outlined-textarea"
                        placeholder="Material"
                        variant="outlined"
                        value={materials_string}
                        onChange={(e) => setMaterials(e.target.value)}
                        fullWidth />
                </Grid>
                <Grid item xs={12}>
                    <SoftInput
                        multiline
                        id="outlined-textarea"
                        placeholder="Tags"
                        variant="outlined"
                        value={tags_string}
                        onChange={(e) => setTags(e.target.value)}
                        fullWidth />
                </Grid>
                <Grid item xs={12} justifyContent="center" display="flex">
                    <SoftButton
                        onClick={update}
                        color="primary"
                        sx={{ marginRight: 1 }}
                    >
                        Update Exercise
                    </SoftButton>
                    <SoftButton
                        onClick={deleteExercise}
                        color="error"
                    >
                        Delete Exercise
                    </SoftButton>
                </Grid>
            </Grid>
        </Container>
    )
}

export default UpdateExercise
