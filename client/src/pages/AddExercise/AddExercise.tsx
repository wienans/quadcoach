import { useNavigate } from "react-router-dom"
import { Grid } from "@mui/material";
import { SoftBox, SoftButton, SoftTypography } from "../../components";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import ExerciseEditForm from "../../components/ExerciseEditForm";
import { ExerciseWithOutId } from "../../api/quadcoachApi/domain";
import { useEffect } from "react";
import { useAddExerciseMutation } from "../exerciseApi";

const AddExercise = () => {
    useUpdateBreadcrumbs("Add Exercise", [{ title: "Exercises", to: "exercises" }])

    const navigate = useNavigate()
    const [addExercise, {
        isLoading: isAddExerciseLoading,
        isError: isAddExerciseError,
        isSuccess: isAddExerciseSuccess,
    }] = useAddExerciseMutation();

    useEffect(() => {
        if (!isAddExerciseSuccess) return;

        navigate("/")
    }, [isAddExerciseSuccess])

    const onSubmit = (values: ExerciseWithOutId) => {
        addExercise(values)
    }

    return (
        <ExerciseEditForm
            extraRows={() => (
                <>
                    {isAddExerciseError && <Grid item xs={12} justifyContent="center" display="flex">
                        <SoftBox bgColor="error">
                            Some error occurred while adding the exercise.
                        </SoftBox>
                    </Grid>
                    }
                    <Grid item xs={12} justifyContent="center" display="flex">
                        <SoftButton
                            type="submit"
                            color="primary"
                            disabled={isAddExerciseLoading}
                        >
                            Add Exercise
                        </SoftButton>
                    </Grid>
                </>
            )}
            header={<SoftTypography variant="h3">Add Exercise</SoftTypography>}
            onSubmit={onSubmit}
        />
    )
}

export default AddExercise
