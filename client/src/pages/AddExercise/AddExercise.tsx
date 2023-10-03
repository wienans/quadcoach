import React from "react";
import { useNavigate } from "react-router-dom"
import { Grid } from "@mui/material";
import { SoftButton, SoftInput, SoftTypography } from "../../components";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import ExerciseEditForm from "../../components/ExerciseEditForm";

const AddExercise = () => {
    useUpdateBreadcrumbs("Add Exercise", [{ title: "Exercises", to: "exercises" }])

    const navigate = useNavigate()

    const add = async (exercise) => {
        const dataStringyfied = JSON.stringify(exercise)

        console.warn(dataStringyfied)
        let result = await fetch("/api/add-exercise", {
            method: 'post',
            body: dataStringyfied,
            headers: {
                'Content-Type': 'application/json'
            }
        })

        navigate("/")
    }

    const onSubmit = (values) => {
        add(values)
    }

    return (
        <ExerciseEditForm
            extraRows={(isValid) => (<Grid item xs={12} justifyContent="center" display="flex">
                <SoftButton
                    type="submit"
                    color="primary"
                >
                    Add Exercise
                </SoftButton>
            </Grid>)}
            header={<SoftTypography variant="h3">Add Exercise</SoftTypography>}
            onSubmit={onSubmit}
        />
    )
}

export default AddExercise
