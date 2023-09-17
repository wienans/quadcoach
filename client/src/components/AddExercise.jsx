import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import { Typography } from "@mui/material";

const AddExercise = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [video_url, setVideoUrl] = useState("");
    const [time_min, setTimeMin] = useState(0);
    const [persons, setPersons] = useState(0);
    const [materials_string, setMaterials] = useState("");
    const [tags_string, setTags] = useState("");
    const [error, setError] = useState(false)

    const navigate = useNavigate()

    const add = async () => {
        if (!name || !description) {
            setError(true)
            return false
        }
        let materials = materials_string.replace(/\s/g, '').split(',')
        let tags = tags_string.replace(/\s/g, '').split(',')

        console.warn(JSON.stringify({ name, description, video_url, time_min, persons, materials, tags }))
        let result = await fetch("/api/add-exercise", {
            method: 'post',
            body: JSON.stringify({ name, description, video_url, time_min, persons, materials, tags }),
            headers: {
                'Content-Type': 'application/json'
            }
        })

        navigate("/")
    }

    return (
        <div className="add-product">
            <Stack spacing={2} sx={{ mt: 3 }}>
                <Typography variant="h3">Add Exercise</Typography>
                <TextField error={error && !name} required id="outlined-basic" label="Name" variant="outlined" helperText={error && !name ? 'Enter Name' : ''} value={name} onChange={(e) => setName(e.target.value)} />
                <TextField error={error && !description} required multiline id="outlined-textarea" label="Description" variant="outlined" helperText={error && !description ? 'Enter Description' : ''} value={description} onChange={(e) => setDescription(e.target.value)} />
                <TextField id="outlined-basic" label="Video URL" variant="outlined" placeholder="https://www.youtube.com/" value={video_url} onChange={(e) => setVideoUrl(e.target.value)} />
                <TextField type="number" inputProps={{ min: 0, step: "1" }} id="outlined-basic" label="Suggested Time" variant="outlined" InputProps={{ endAdornment: <InputAdornment position="end">minutes</InputAdornment>, }} value={time_min} onChange={(e) => setTimeMin(e.target.value)} />
                <TextField type="number" inputProps={{ min: 0, step: "1" }} id="outlined-basic" label="Person Number" variant="outlined" value={persons} onChange={(e) => setPersons(e.target.value)} />
                <TextField multiline id="outlined-textarea" label="Material" variant="outlined" value={materials_string} onChange={(e) => setMaterials(e.target.value)} />
                <TextField multiline id="outlined-textarea" label="Tags" variant="outlined" value={tags_string} onChange={(e) => setTags(e.target.value)} />
                <Button onClick={add} variant="contained">Add Exercise</Button>
            </Stack>
        </div>
    )
}

export default AddExercise