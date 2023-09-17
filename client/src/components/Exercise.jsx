import React from "react";
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";
import Collapsible from "./Collapsible";
// import { Link } from "react-router-dom";
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Typography } from "@mui/material";
import Divider from '@mui/material/Divider';

const Exercise = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [video_url, setVideoUrl] = useState("");
    const [time_min, setTimeMin] = useState(0);
    const [persons, setPersons] = useState(0);
    const [materials_string, setMaterials] = useState("");
    const [tags_string, setTags] = useState("");
    // const [error, setError] = useState(false)

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

        navigate(`/update/${params.id}`)

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
        <div className="add-product">
            <Stack spacing={2} sx={{ mt: 3 }}>
                <Typography variant="h3">Exercise: {name}</Typography>
                <Collapsible label="Description">
                    {description}
                </Collapsible>
                <Divider />
                <Link href={video_url}>Video URL</Link>{' '}
                <Divider />
                <Typography>Suggested Time in minutes: {time_min}</Typography>
                <Divider />
                <Typography>Person Number:  {persons}</Typography>
                <Divider />
                <Collapsible label="Material">
                    {materials_string}
                </Collapsible>
                <Divider />
                <Collapsible label="Tags">
                    {tags_string}
                </Collapsible>
                <Divider />
                <Stack direction="row" spacing={1}>
                    <Button onClick={update} sx={{ margin: 1 }} variant="contained">Update Exercise</Button>
                    <Button onClick={deleteExercise} sx={{ margin: 1 }} variant="contained">Delete Exercise</Button>
                </Stack>
            </Stack>
        </div >
    )
}

export default Exercise