import React from "react";
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";
import Collapsible from "../../components/Collapsible";
// import { Link } from "react-router-dom";
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Container, Grid, Typography } from "@mui/material";
import Divider from '@mui/material/Divider';
import { SoftButton, SoftTypography } from "../../components";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";

const Exercise = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [video_url, setVideoUrl] = useState("");
    const [time_min, setTimeMin] = useState(0);
    const [persons, setPersons] = useState(0);
    const [materials_string, setMaterials] = useState("");
    const [tags_string, setTags] = useState("");
    // const [error, setError] = useState(false)

    useUpdateBreadcrumbs(name ? `Übung ${name}` : "Übung ansehen", [{ title: "Übungen", to: "exercises" }])

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
        navigate(`/exercises/${params.id}/update`)
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

    const hasVideoUrl = video_url && video_url !== ""

    return (
        <Container fixed>
            <Grid container spacing={2}>
                <Grid item xs={12} justifyContent="center" display="flex">
                    <SoftTypography variant="h1">{`Exercise: ${name}`}</SoftTypography>
                </Grid>
                <Grid item xs={12} justifyContent="center" display="flex">
                    <SoftTypography variant="h3">{`Description: ${description}`}</SoftTypography>
                </Grid>
                <Grid item xs={12} justifyContent="center" display="flex">
                    <SoftTypography variant="h3">{`Video URL:${hasVideoUrl ? " " : " -"}`}</SoftTypography>
                    {
                        hasVideoUrl && <Link href={video_url}>open</Link>
                    }
                </Grid>
                <Grid item xs={12} justifyContent="center" display="flex">
                    <SoftTypography variant="h3">{`Suggested Time in minutes: ${time_min}`}</SoftTypography>
                </Grid>
                <Grid item xs={12} justifyContent="center" display="flex">
                    <SoftTypography variant="h3">{`Person Number: ${persons}`}</SoftTypography>
                </Grid>
                <Grid item xs={12} justifyContent="center" display="flex">
                    <SoftTypography variant="h3">{`Material: ${materials_string}`}</SoftTypography>
                </Grid>
                <Grid item xs={12} justifyContent="center" display="flex">
                    <SoftTypography variant="h3">{`Tags: ${tags_string}`}</SoftTypography>
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

export default Exercise
