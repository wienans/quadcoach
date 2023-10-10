import { useParams, useNavigate } from "react-router-dom"
import { useEffect } from "react";
import { Alert, Box, Card, CardActions, CardContent, Grid, LinearProgress, Skeleton, } from "@mui/material";
import { SoftBox, SoftButton, SoftTypography } from "../../components";
import { useUpdateBreadcrumbs } from "../../components/Layout/hooks";
import { Chip } from "@mui/material"
import CopyrightIcon from '@mui/icons-material/Copyright';
import ReactPlayer from 'react-player'
import { Exercise } from "../../api/quadcoachApi/domain";
import { useDeleteExerciseMutation, useGetExerciseQuery, useGetRelatedExercisesQuery } from "../exerciseApi";

type ExerciseValue = {
    label: string;
    getElement: (exercise: Exercise) => JSX.Element
}

const values: ExerciseValue[] = [
    {
        label: "Person Number:",
        getElement: exercise => (
            <SoftTypography variant="button" fontWeight="regular" color="text">{exercise.persons}</SoftTypography>
        )
    },
    {
        label: "Beater Number:",
        getElement: exercise => (
            <SoftTypography variant="button" fontWeight="regular" color="text">{exercise.beaters}</SoftTypography>
        )
    },
    {
        label: "Chaser Number:",
        getElement: exercise => (
            <SoftTypography variant="button" fontWeight="regular" color="text">{exercise.chasers}</SoftTypography>
        )
    },
    {
        label: "Time:",
        getElement: exercise => (
            <SoftTypography variant="button" fontWeight="regular" color="text">{exercise.time_min} Min</SoftTypography>
        )
    },
]

const Exercise = () => {
    const { id: exerciseId } = useParams()
    const navigate = useNavigate()
    const { data: exercise, isLoading: isExerciseLoading, isError: isExerciseError } = useGetExerciseQuery(exerciseId || "", {
        skip: exerciseId == null
    })
    const { data: relatedExercises, isLoading: isRelatedExercisesLoading, isError: isRelatedExercisesError } = useGetRelatedExercisesQuery(exerciseId || "", {
        skip: exerciseId == null
    })

    useUpdateBreadcrumbs(exercise?.name ? `Exercise ${exercise?.name}` : "View exercise", [{ title: "Exercises", to: "exercises" }])

    const update = async () => {
        navigate(`/exercises/${exerciseId}/update`)
    }

    const [deleteExercise, { isError: isDeleteExerciseError, isLoading: isDeleteExerciseLoading, isSuccess: isDeleteExerciseSuccess }] = useDeleteExerciseMutation();
    const onDeleteExerciseClick = () => {
        if (!exercise) return;
        deleteExercise(exercise._id);
    }
    useEffect(() => {
        if (!isDeleteExerciseSuccess) return;
        navigate("/")
    }, [isDeleteExerciseSuccess])

    const handleChipClick = (id: string) => {
        navigate(`/exercises/${id}`)
    };

    if (isExerciseLoading) {
        return (
            <>
                <Card>
                    <Skeleton variant="rectangular" width={"100%"} height={120} />
                </Card>
                <SoftBox mt={5} mb={3}>
                    <Skeleton variant="rectangular" width={"100%"} height={120} />
                </SoftBox>
                <SoftBox mt={5} mb={3}>
                    <Skeleton variant="rectangular" width={"100%"} height={120} />
                </SoftBox>
                <SoftBox mt={5} mb={3}>
                    <Skeleton variant="rectangular" width={"100%"} height={120} />
                </SoftBox>
            </>
        )
    }

    if (!exercise || isExerciseError) {
        return (
            <Alert color="error">
                Error while loading exercise
            </Alert>
        )
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
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item>
                            <SoftBox height="100%" mt={0.5} lineHeight={1}>
                                <SoftTypography variant="h4" fontWeight="bold">
                                    {exercise.name}
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
                                onClick={onDeleteExerciseClick}
                                color="error"
                                disabled={!exercise || isDeleteExerciseLoading}
                            >
                                Delete Exercise
                            </SoftButton>
                        </Grid>
                    </Grid>
                </CardContent>
                {(isDeleteExerciseLoading || isRelatedExercisesLoading) &&
                    <CardActions>
                        <LinearProgress />
                    </CardActions>
                }
            </Card>
            {
                isDeleteExerciseError && <Alert color="error" sx={{ mt: 5, mb: 3 }}>Error occurred while deleting exercise</Alert>
            }
            {
                isRelatedExercisesError && <Alert color="error" sx={{ mt: 5, mb: 3 }}>Error occurred while loading related exercises</Alert>
            }
            <SoftBox mt={5} mb={3}>
                <Card sx={{ height: "100%" }}>
                    <SoftBox p={2}>
                        <SoftTypography variant="h5" fontWeight="bold" textTransform="uppercase">
                            Info
                        </SoftTypography>
                        <SoftBox>
                            <Grid container spacing={2}>
                                {values.map(({ label, getElement }) => (
                                    <Grid item xs={6} sm={3} key={label}>
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
                        <SoftBox >
                            <SoftTypography variant="button" fontWeight="bold" textTransform="capitalize" mr={2}>
                                Materials:
                            </SoftTypography>
                            {exercise.materials?.filter(el => el !== "").map((el, index) => <Chip size="small" key={el + index} label={el} sx={{ margin: "2px" }} variant={"outlined"} />)}
                        </SoftBox>
                        <SoftBox>
                            <SoftTypography variant="button" fontWeight="bold" textTransform="capitalize" mr={2}>
                                Tags:
                            </SoftTypography>
                            {exercise.tags?.filter(el => el !== "").map((el, index) => <Chip size="small" key={el + index} label={el} sx={{ margin: "2px" }} variant={"outlined"} />)}
                        </SoftBox>
                        <SoftBox>
                            <SoftTypography variant="button" fontWeight="bold" textTransform="capitalize" mr={2}>
                                Related To:
                            </SoftTypography>
                            {isRelatedExercisesLoading
                                ? <Box sx={{ display: "flex" }}>{Array.from(Array(5).keys()).map(k => <Skeleton key={k} variant="rounded" width={30} sx={{ mr: 1 }} />)}</Box>
                                : relatedExercises?.map((relatedExercise) => <Chip
                                    size="small"
                                    key={relatedExercise._id}
                                    label={relatedExercise.name}
                                    sx={{ margin: "2px" }}
                                    variant={"outlined"}
                                    onClick={() => { handleChipClick(relatedExercise._id) }}
                                />)}
                        </SoftBox>
                        <SoftBox textAlign={"right"}>
                            <SoftTypography variant="button" fontWeight="regular" textTransform="capitalize" mr={2} align={"right"}>
                                <CopyrightIcon /> {exercise.creator}
                            </SoftTypography>
                        </SoftBox>
                    </SoftBox>
                </Card>
            </SoftBox>
            {exercise.description_blocks?.map((el, index) => {
                return (
                    <SoftBox mt={3} mb={3} key={el._id}>
                        <Card sx={{ height: "100%", padding: 2 }}>
                            <SoftBox mb={2}>
                                <SoftTypography variant="h5" fontWeight="bold" textTransform="uppercase" >
                                    Block {index + 1}
                                </SoftTypography>
                                <SoftTypography variant="button" textTransform="capitalize" mr={2} >
                                    Time: {el.time_min} minutes
                                </SoftTypography>
                            </SoftBox>
                            <SoftBox display={el.video_url != "" ? 'block' : 'none'} sx={{ paddingTop: "56.26%", position: "relative" }}>
                                <ReactPlayer style={{ position: "absolute", top: "0px", left: "0px" }} url={el.video_url} width="100%" height="100%" controls={true} light={true} />
                            </SoftBox>
                            <SoftBox mt={3}>
                                <SoftTypography variant="h5" fontWeight="bold" textTransform="uppercase" >
                                    Description
                                </SoftTypography>
                                <SoftTypography variant="body2" textTransform="capitalize" mr={2} >
                                    {el.description}
                                </SoftTypography>
                            </SoftBox>
                            <SoftBox mt={3}>
                                <SoftTypography variant="h5" fontWeight="bold" textTransform="uppercase">
                                    Coaching Points
                                </SoftTypography>
                                <SoftTypography variant="body2" textTransform="capitalize" mr={2} >
                                    {el.coaching_points}
                                </SoftTypography>
                            </SoftBox>
                        </Card>
                    </SoftBox>
                )
            }
            )}
        </>
    )
}

export default Exercise
