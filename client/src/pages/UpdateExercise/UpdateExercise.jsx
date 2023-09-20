import React from "react";
import { useParams, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";
import { Grid, } from "@mui/material";
import { SoftButton, SoftTypography } from "../../components";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import ExerciseEditForm from "../../components/ExerciseEditForm";

const defaultEBreadcrumbRoutes = [{ title: "Exercises", to: "exercises" }]

const UpdateExercise = () => {
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
    const [breadcrumbRoutes, setBreadcrumbRoutes] = useState([...defaultEBreadcrumbRoutes])

    useUpdateBreadcrumbs(
        "update",
        breadcrumbRoutes
    )

    const params = useParams()

    const navigate = useNavigate()

    useEffect(() => {
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

        getExerciseDetails()
    }, [])

    useEffect(() => {
        const routes = [...defaultEBreadcrumbRoutes]
        if (exercise) {
            routes.push({ title: exercise.name, to: `exercises/${exercise.id}` })
        }

        setBreadcrumbRoutes(routes)
    }, [exercise])

    const update = async (exercise) => {

        const dataStringyfied = JSON.stringify(exercise)

        let result = await fetch(`/api/exercise/${params.id}`, {
            method: "put",
            body: dataStringyfied,
            headers: {
                'Content-Type': 'application/json'
            }
        })
        result = await result.json()

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

    const onSubmit = (exercise) => {
        update(exercise)
    }

    return (
        <ExerciseEditForm
            extraRows={(isValid) => (<Grid item xs={12} justifyContent="center" display="flex">
                <SoftButton
                    color="primary"
                    sx={{ marginRight: 1 }}
                    type="submit"
                    disabled={!isValid}
                >
                    Update Exercise
                </SoftButton>
                <SoftButton
                    onClick={deleteExercise}
                    color="error"
                    type="button"
                >
                    Delete Exercise
                </SoftButton>
            </Grid>)}
            header={<SoftTypography variant="h3">Update Exercise</SoftTypography>}
            initialValues={{
                ...exercise
            }}
            onSubmit={onSubmit}
        />
    )
}

export default UpdateExercise
