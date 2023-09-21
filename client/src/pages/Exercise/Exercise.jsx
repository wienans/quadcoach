import React from "react";
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import Link from '@mui/material/Link';
import { Card, Grid, } from "@mui/material";
import { SoftBox, SoftButton, SoftTypography } from "../../components";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";

const values = [
    {
        label: "Description:",
        getElement: exercise => (
            <SoftTypography variant="button" fontWeight="regular" color="text">{exercise.description}</SoftTypography>
        )
    },
    {
        label: "Video URL:",
        getElement: exercise => exercise.videoUrl && exercise.videoUrl !== ""
            ? <Link variant="button" fontWeight="regular" href={exercise.videoUrl} target="_blank">{exercise.videoUrl}</Link>
            : <SoftTypography variant="button" fontWeight="regular" color="text">-</SoftTypography>
    },
    {
        label: "Suggested Time (minutes):",
        getElement: exercise => (
            <SoftTypography variant="button" fontWeight="regular" color="text">{exercise.timeMin}</SoftTypography>
        )
    },
    {
        label: "Person Number:",
        getElement: exercise => (
            <SoftTypography variant="button" fontWeight="regular" color="text">{exercise.persons}</SoftTypography>
        )
    },
    {
        label: "Material:",
        getElement: exercise => (
            <SoftTypography variant="button" fontWeight="regular" color="text">{exercise.materialsString}</SoftTypography>
        )
    },
    {
        label: "Tags:",
        getElement: exercise => (
            <SoftTypography variant="button" fontWeight="regular" color="text">{exercise.tagsString}</SoftTypography>
        )
    },
]

const Exercise = () => {
    const [exercise, setExercise] = useState({
        id: null,
        name: "",
        description: "",
        videoUrl: "",
        timeMin: 0,
        persons: 0,
        materialsString: "",
        tagsString: "",
    })

    useUpdateBreadcrumbs(name ? `Exercise ${name}` : "View exercise", [{ title: "Exercises", to: "exercises" }])

    const params = useParams()

    const navigate = useNavigate()

    useEffect(() => {
        getExerciseDetails()
    }, [])

    const getExerciseDetails = async () => {
        let result = await fetch(`/api/exercise/${params.id}`)
        result = await result.json()

        setExercise({
            id: result._id,
            name: result.name,
            description: result.description,
            videoUrl: result.video_url,
            timeMin: result.time_min,
            persons: result.persons,
            materialsString: result.materials.toString(),
            tagsString: result.tags.toString(),
        })
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

    return (
        <>
            <Card
                sx={{
                    backdropFilter: `saturate(200%) blur(30px)`,
                    backgroundColor: ({ functions: { rgba }, palette: { white } }) => rgba(white.main, 0.8),
                    boxShadow: ({ boxShadows: { navbarBoxShadow } }) => navbarBoxShadow,
                    position: "relative",
                    py: 2,
                    px: 2,
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    <Grid item>
                        <SoftBox height="100%" mt={0.5} lineHeight={1}>
                            <SoftTypography variant="h5" fontWeight="medium">
                                {exercise.name}
                            </SoftTypography>
                            <SoftTypography variant="button" color="text" fontWeight="medium">
                                Exercise
                            </SoftTypography>
                        </SoftBox>
                    </Grid>
                    <Grid item sx={{ ml: "auto" }}>
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
            </Card>
            <SoftBox mt={5} mb={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Card sx={{ height: "100%" }}>
                            <SoftBox p={2}>
                                <SoftBox>
                                    <Grid container spacing={2}>
                                        {values.map(({ label, getElement }) => (
                                            <Grid item xs={4} key={label}>
                                                <SoftBox key={label} display="flex" py={1} pr={2}>
                                                    <SoftTypography variant="button" fontWeight="bold" textTransform="capitalize" mr={2}>
                                                        {label}
                                                    </SoftTypography>
                                                    {getElement(exercise)}
                                                </SoftBox>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </SoftBox>
                            </SoftBox>
                        </Card>
                    </Grid>
                </Grid>
            </SoftBox>
        </>
    )
}

export default Exercise
