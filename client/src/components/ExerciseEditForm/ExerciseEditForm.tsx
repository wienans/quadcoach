import { number, shape, string, func, node, array } from "prop-types";
import { ReactNode, useEffect, useState } from 'react';
import { FieldArray, FieldArrayRenderProps, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import {
    Dialog, DialogActions, DialogContent, DialogTitle,
    Chip, FormGroup, FormHelperText, Grid, TextField, Autocomplete, Skeleton, Box
} from "@mui/material";
import SoftTypography from "../SoftTypography";
import SoftInput from "../SoftInput";
import { SoftBox, SoftButton } from "..";
import { Block, Exercise, ExerciseWithOutId } from "../../api/quadcoachApi/domain";
import { useGetExercisesQuery } from "../../pages/exerciseApi";
import ExerciseAutocomplete from "../ExerciseAutocomplete/ExerciseAutocomplete";

const exerciseShape = shape({
    name: string,
    time_min: number,
    persons: number,
    beaters: number,
    chasers: number,
    materials: array,
    tags: array,
    description_blocks: array,
    relatedTo: array,
})

const emptyDescriptionBlock = {
    description: "",
    video_url: "",
    coaching_points: "",
    time_min: 0
}

export type ExerciseEditFormProps = {
    initialValues?: Exercise;
    onSubmit: (exercise: ExerciseWithOutId) => void;
    extraRows?: (isValid: boolean) => JSX.Element;
    header?: ReactNode;
    isLoadingInitialValues?: boolean;
}

/**
 * 
 * @param {
 *  initialValues: values which should be used at start, for example when editing an existing exercise
 *  onSubmit: function called with values, if user press button with type="submit" and values are valid
 *  extraRows: function returning JSX element with submit button or more in it. Function gets isValid from validation.
 * } param0 
 * @returns 
 */
const ExerciseEditForm = ({ initialValues, onSubmit, extraRows, header: Header, isLoadingInitialValues = false }: ExerciseEditFormProps) => {
    const [openTagDialog, setOpenTagDialog] = useState<boolean>(false);
    const [newTag, setNewTag] = useState<string>("");
    const [openMaterialDialog, setOpenMaterialDialog] = useState<boolean>(false);
    const [newMaterial, setNewMaterial] = useState<string>("");
    const [openRelatedDialog, setOpenRelatedDialog] = useState<boolean>(false);
    const [newRelatedEx, setNewRelatedEx] = useState<string>("");
    const [exercises, setExercises] = useState<Exercise[]>([])

    const handleAddRelatedExercise = (arrayHelpers: FieldArrayRenderProps) => {
        if (newRelatedEx !== "") {
            let foundEx = exercises.find((el) => {
                return el.name == newRelatedEx
            })
            if (foundEx != null) {
                arrayHelpers.push(foundEx._id)
            } else {
                console.log("Didn't Found Exercise")
            }

        }
    }

    useEffect(() => {
        const getExercises = async () => {
            const result: Exercise[] | undefined = (await (await fetch("/api/exercises")).json())
            setExercises(result ? result : [])
        }

        getExercises()
    }, [])

    const formik = useFormik<ExerciseWithOutId>({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            name: initialValues?.name ?? "",
            persons: initialValues?.persons ?? 0,
            time_min: initialValues?.time_min ?? 0,
            beaters: initialValues?.beaters ?? 0,
            chasers: initialValues?.chasers ?? 0,
            materials: initialValues?.materials ?? [],
            tags: initialValues?.tags ?? [],
            description_blocks: initialValues?.description_blocks ?? [],
            related_to: initialValues?.related_to ?? [],
        },

        validationSchema: Yup.object({
            name: Yup.string().required("Please enter a name"),
            persons: Yup.number().min(0),
            beaters: Yup.number().min(0).required("Please enter number of Beaters"),
            chasers: Yup.number().min(0).required("Please enter number of Chasers"),
            materials: Yup.array().of(Yup.string()),
            tags: Yup.array().of(Yup.string()),
            description_blocks: Yup.array().of(Yup.object({
                description: Yup.string().required("Please enter a description"),
                video_url: Yup.string().url("Please enter a valid url"),
                coaching_points: Yup.string(),
                timeMin: Yup.number(),
            })),
            related_to: Yup.array().of(Yup.string()),
        }),

        onSubmit: (values) => {
            const { materials, tags, name, persons, beaters, chasers, description_blocks, related_to } = values
            const calculate_persons = beaters + chasers
            const calculate_time = description_blocks.reduce((partialSum, current) => partialSum + current.time_min, 0)
            const exercise: ExerciseWithOutId = {
                name,
                persons: persons > calculate_persons ? persons : calculate_persons,
                time_min: calculate_time,
                beaters,
                chasers,
                materials,
                tags,
                related_to,
                description_blocks,
            }
            onSubmit(exercise)
        },
    })

    const getDescriptionBlockFormikError = (descriptionBlockIndex: number, field: keyof Block): string | undefined => {
        if (!formik.touched?.description_blocks?.[descriptionBlockIndex] || !formik.errors.description_blocks) return;
        if (typeof formik.errors.description_blocks === "string") return formik.errors.description_blocks;
        if (!formik.errors.description_blocks[descriptionBlockIndex]) return;
        const errorForBlock = formik.errors.description_blocks[descriptionBlockIndex];
        if (typeof errorForBlock === "string") return errorForBlock;
        return errorForBlock[field]
    }

    return (
        <FormikProvider value={formik}>
            <form onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                formik.handleSubmit()
                return false
            }}>
                <Grid container spacing={2}>
                    {Header && <Grid item xs={12}>
                        {Header}
                    </Grid>}
                    {isLoadingInitialValues
                        ? (
                            <>
                                <Grid item xs={12}>
                                    <Skeleton variant="rectangular" width={"100%"} height={120} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Skeleton variant="rectangular" width={"100%"} height={120} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Skeleton variant="rectangular" width={"100%"} height={120} />
                                </Grid>
                            </>
                        )
                        : (
                            <>
                                <Grid item xs={12}>
                                    <SoftBox variant="contained" shadow="lg" opacity={1} p={1} my={2} borderRadius="lg">
                                        <SoftTypography variant="h5" fontWeight="bold" textTransform="uppercase">Info</SoftTypography>
                                        <Grid item xs={12} p={1}>
                                            <FormGroup>
                                                <SoftTypography variant="body2">Name</SoftTypography>
                                                <SoftInput
                                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                                    name="name"
                                                    required
                                                    id="outlined-basic"
                                                    placeholder="Name"
                                                    variant="outlined"
                                                    value={formik.values.name}
                                                    onChange={formik.handleChange}
                                                    fullWidth
                                                    onBlur={formik.handleBlur}
                                                />
                                                {formik.touched.name && Boolean(formik.errors.name) && <FormHelperText error>{formik.errors.name}</FormHelperText>}
                                            </FormGroup>
                                        </Grid>
                                        <Grid item xs={12} p={1}>
                                            <FormGroup>
                                                <SoftTypography variant="body2">Person amount</SoftTypography>
                                                <SoftInput
                                                    type="number"
                                                    inputProps={{ min: 0, step: "1" }}
                                                    error={formik.touched.persons != null && Boolean(formik.errors.persons)}
                                                    name="persons"
                                                    required
                                                    id="outlined-basic"
                                                    placeholder="Persons"
                                                    variant="outlined"
                                                    value={formik.values.persons}
                                                    onChange={formik.handleChange}
                                                    fullWidth
                                                    onBlur={formik.handleBlur}
                                                />
                                                {formik.touched.persons != null && Boolean(formik.errors.persons) && <FormHelperText error>{formik.errors.persons}</FormHelperText>}
                                            </FormGroup>
                                        </Grid>
                                        <Grid item xs={12} p={1}>
                                            <FormGroup>
                                                <SoftTypography variant="body2">Chaser amount</SoftTypography>
                                                <SoftInput
                                                    type="number"
                                                    inputProps={{ min: 0, step: "1" }}
                                                    error={formik.touched.chasers != null && Boolean(formik.errors.chasers)}
                                                    name="chasers"
                                                    required
                                                    id="outlined-basic"
                                                    placeholder="Chaser"
                                                    variant="outlined"
                                                    value={formik.values.chasers}
                                                    onChange={formik.handleChange}
                                                    fullWidth
                                                    onBlur={formik.handleBlur}
                                                />
                                                {formik.touched.chasers != null && Boolean(formik.errors.chasers) && <FormHelperText error>{formik.errors.chasers}</FormHelperText>}
                                            </FormGroup>
                                        </Grid>
                                        <Grid item xs={12} p={1}>
                                            <FormGroup>
                                                <SoftTypography variant="body2">Beater amount</SoftTypography>
                                                <SoftInput
                                                    type="number"
                                                    inputProps={{ min: 0, step: "1" }}
                                                    error={formik.touched.beaters != null && Boolean(formik.errors.beaters)}
                                                    name="beaters"
                                                    required
                                                    id="outlined-basic"
                                                    placeholder="Beater"
                                                    variant="outlined"
                                                    value={formik.values.beaters}
                                                    onChange={formik.handleChange}
                                                    fullWidth
                                                    onBlur={formik.handleBlur}
                                                />
                                                {formik.touched.beaters != null && Boolean(formik.errors.beaters) && <FormHelperText error>{formik.errors.beaters}</FormHelperText>}
                                            </FormGroup>
                                        </Grid>
                                        <Grid item xs={12} p={1}>
                                            <FormGroup>
                                                <SoftTypography variant="body2">Materials</SoftTypography>
                                                <FieldArray
                                                    name="materials"
                                                    render={(arrayHelpers) => {
                                                        return (
                                                            <div>
                                                                {formik.values.materials?.map((el, index) => {
                                                                    if (el != "") {
                                                                        return <Chip size="small" key={el + index} label={el} sx={{ margin: "2px" }} variant={"outlined"} onDelete={() => {
                                                                            arrayHelpers.remove(index)
                                                                        }} />;
                                                                    }
                                                                }

                                                                )}
                                                                <Chip size="small" label="+" sx={{ margin: "2px" }} color="info" onClick={() => { setOpenMaterialDialog(true); setNewMaterial("") }} />
                                                                <Dialog open={openMaterialDialog} onClose={() => { setOpenMaterialDialog(false) }}>
                                                                    <DialogTitle>Add Material</DialogTitle>
                                                                    <DialogContent>
                                                                        <Autocomplete
                                                                            id="material-text"
                                                                            freeSolo
                                                                            options={["Cones", "Hoops"]}
                                                                            renderInput={(params) =>
                                                                                <TextField
                                                                                    {...params}
                                                                                    autoFocus
                                                                                    id="name"
                                                                                    fullWidth
                                                                                    value={newMaterial}
                                                                                    onChange={(e) => { setNewMaterial(e.target.value) }}
                                                                                    onBlur={(e) => { setNewMaterial(e.target.value) }}
                                                                                />
                                                                            }
                                                                        />
                                                                    </DialogContent>
                                                                    <DialogActions>
                                                                        <SoftButton color="error" onClick={() => { setOpenMaterialDialog(false) }}>Cancel</SoftButton>
                                                                        <SoftButton color="success" onClick={() => { arrayHelpers.push(newMaterial); setOpenMaterialDialog(false) }}>Add</SoftButton>
                                                                    </DialogActions>
                                                                </Dialog>
                                                            </div>
                                                        )
                                                    }}
                                                />
                                            </FormGroup>
                                        </Grid>
                                        <Grid item xs={12} p={1}>
                                            <FormGroup>
                                                <SoftTypography variant="body2">Tags</SoftTypography>
                                                <FieldArray
                                                    name="tags"
                                                    render={(arrayHelpers) => {
                                                        return (
                                                            <div>
                                                                {formik.values.tags?.map((el, index) => {
                                                                    if (el != "") {
                                                                        return <Chip size="small" key={el + index} label={el} sx={{ margin: "2px" }} variant={"outlined"} onDelete={() => {
                                                                            arrayHelpers.remove(index)
                                                                        }} />;
                                                                    }
                                                                }

                                                                )}
                                                                <Chip size="small" label="+" sx={{ margin: "2px" }} color="info" onClick={() => { setOpenTagDialog(true); setNewTag("") }} />
                                                                <Dialog open={openTagDialog} onClose={() => { setOpenTagDialog(false) }}>
                                                                    <DialogTitle>Add Tag</DialogTitle>
                                                                    <DialogContent>
                                                                        <Autocomplete
                                                                            id="tag-text"
                                                                            freeSolo
                                                                            options={["Beater", "Chaser", "Keeper", "Warm-Up"]}
                                                                            renderInput={(params) =>
                                                                                <TextField
                                                                                    {...params}
                                                                                    autoFocus
                                                                                    id="name"
                                                                                    fullWidth
                                                                                    value={newTag}
                                                                                    onChange={(e) => { setNewTag(e.target.value) }}
                                                                                    onBlur={(e) => { setNewTag(e.target.value) }}
                                                                                />
                                                                            }
                                                                        />
                                                                    </DialogContent>
                                                                    <DialogActions>
                                                                        <SoftButton color="error" onClick={() => { setOpenTagDialog(false) }}>Cancel</SoftButton>
                                                                        <SoftButton color="success" onClick={() => { arrayHelpers.push(newTag); setOpenTagDialog(false) }}>Add</SoftButton>
                                                                    </DialogActions>
                                                                </Dialog>
                                                            </div>
                                                        )
                                                    }}
                                                />
                                            </FormGroup>
                                        </Grid>

                                        <Grid item xs={12} p={1}>
                                            <FormGroup>
                                                <SoftTypography variant="body2">Related To:</SoftTypography>
                                                <FieldArray
                                                    name="related_to"
                                                    render={(arrayHelpers) => {
                                                        return (
                                                            <div>
                                                                {formik.values.related_to?.map((el, index) => {
                                                                    let foundEx = exercises.find((ex) => {
                                                                        return ex._id == el
                                                                    })
                                                                    if (foundEx != null) {
                                                                        return <Chip size="small" key={el + index} label={foundEx.name} sx={{ margin: "2px" }} variant={"outlined"} onDelete={() => {
                                                                            arrayHelpers.remove(index)
                                                                        }} />;
                                                                    }
                                                                }

                                                                )}
                                                                <Chip size="small" label="+" sx={{ margin: "2px" }} color="info" onClick={() => { setOpenRelatedDialog(true); setNewRelatedEx("") }} />
                                                                <Dialog open={openRelatedDialog} onClose={() => { setOpenRelatedDialog(false) }}>
                                                                    <DialogTitle>Add Related Exercise</DialogTitle>
                                                                    <DialogContent>
                                                                        <ExerciseAutocomplete />
                                                                        {/* <Autocomplete
                                                                            id="related-text"
                                                                            options={exercises.map((el) => el.name)}
                                                                            renderInput={(params) =>
                                                                                <TextField
                                                                                    {...params}
                                                                                    autoFocus
                                                                                    id="name"
                                                                                    fullWidth
                                                                                    value={newRelatedEx}
                                                                                    onChange={(e) => { setNewRelatedEx(e.target.value) }}
                                                                                    onBlur={(e) => { setNewRelatedEx(e.target.value) }}
                                                                                />
                                                                            }
                                                                        /> */}
                                                                    </DialogContent>
                                                                    <DialogActions>
                                                                        <SoftButton color="error" onClick={() => { setOpenRelatedDialog(false) }}>Cancel</SoftButton>
                                                                        <SoftButton color="success" onClick={() => { handleAddRelatedExercise(arrayHelpers); setOpenRelatedDialog(false) }}>Add</SoftButton>
                                                                    </DialogActions>
                                                                </Dialog>
                                                            </div>
                                                        )
                                                    }}
                                                />
                                            </FormGroup>
                                        </Grid>
                                    </SoftBox>
                                </Grid>
                                <Grid item xs={12}>
                                    <FieldArray
                                        name="description_blocks"
                                        render={(arrayHelpers) => {
                                            return (
                                                <div>
                                                    {formik.values.description_blocks.map((_, index) => {
                                                        return (
                                                            <SoftBox key={index} variant="contained" shadow="lg" opacity={1} p={1} my={2} borderRadius="lg">
                                                                <SoftTypography variant="h5" fontWeight="bold" textTransform="uppercase">Block {index + 1}</SoftTypography>
                                                                <Grid item xs={12} p={1}>
                                                                    <FormGroup>
                                                                        <SoftTypography variant="body2">Video URL</SoftTypography>
                                                                        <SoftInput
                                                                            error={Boolean(getDescriptionBlockFormikError(index, "video_url"))}
                                                                            name={`description_blocks[${index}].video_url`}
                                                                            id="outlined-basic"
                                                                            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                                                            variant="outlined"
                                                                            value={formik.values.description_blocks[index].video_url}
                                                                            onChange={formik.handleChange}
                                                                            fullWidth
                                                                            multiline
                                                                            onBlur={formik.handleBlur}
                                                                        />
                                                                        {Boolean(getDescriptionBlockFormikError(index, "video_url")) && <FormHelperText error>{getDescriptionBlockFormikError(index, "video_url")}</FormHelperText>}
                                                                    </FormGroup>
                                                                </Grid>
                                                                <Grid item xs={12} p={1}>
                                                                    <FormGroup>
                                                                        <SoftTypography variant="body2">Description</SoftTypography>
                                                                        <SoftInput
                                                                            error={Boolean(getDescriptionBlockFormikError(index, "description"))}
                                                                            name={`description_blocks[${index}].description`}
                                                                            id="outlined-basic"
                                                                            placeholder="Description"
                                                                            variant="outlined"
                                                                            value={formik.values.description_blocks[index].description}
                                                                            onChange={formik.handleChange}
                                                                            fullWidth
                                                                            multiline
                                                                            minRows={5}
                                                                            onBlur={formik.handleBlur}
                                                                        />
                                                                        {Boolean(getDescriptionBlockFormikError(index, "description")) && <FormHelperText error>{getDescriptionBlockFormikError(index, "description")}</FormHelperText>}
                                                                    </FormGroup>
                                                                </Grid>
                                                                <Grid item xs={12} p={1}>
                                                                    <FormGroup>
                                                                        <SoftTypography variant="body2">Coaching Points</SoftTypography>
                                                                        <SoftInput
                                                                            error={Boolean(getDescriptionBlockFormikError(index, "coaching_points"))}
                                                                            name={`description_blocks[${index}].coaching_points`}
                                                                            id="outlined-basic"
                                                                            placeholder="Coaching Points"
                                                                            variant="outlined"
                                                                            value={formik.values.description_blocks[index].coaching_points}
                                                                            onChange={formik.handleChange}
                                                                            fullWidth
                                                                            multiline
                                                                            minRows={5}
                                                                            onBlur={formik.handleBlur}
                                                                        />
                                                                        {Boolean(getDescriptionBlockFormikError(index, "coaching_points")) && <FormHelperText error>{getDescriptionBlockFormikError(index, "coaching_points")}</FormHelperText>}
                                                                    </FormGroup>
                                                                </Grid>
                                                                <Grid item xs={12} p={1}>
                                                                    <FormGroup>
                                                                        <SoftTypography variant="body2">Suggested Time (Minutes)</SoftTypography>
                                                                        <SoftInput
                                                                            type="number"
                                                                            inputProps={{ min: 0, step: "1" }}
                                                                            error={Boolean(getDescriptionBlockFormikError(index, "time_min"))}
                                                                            name={`description_blocks[${index}].time_min`}
                                                                            id="outlined-basic"
                                                                            placeholder="Minutes"
                                                                            variant="outlined"
                                                                            value={formik.values.description_blocks[index].time_min}
                                                                            onChange={formik.handleChange}
                                                                            fullWidth
                                                                            onBlur={formik.handleBlur}
                                                                        />
                                                                        {Boolean(getDescriptionBlockFormikError(index, "time_min")) && <FormHelperText error>{getDescriptionBlockFormikError(index, "time_min")}</FormHelperText>}
                                                                    </FormGroup>
                                                                </Grid>
                                                                <SoftButton color="error" onClick={() => {
                                                                    arrayHelpers.remove(index)
                                                                }}>
                                                                    Remove Block
                                                                </SoftButton>
                                                            </SoftBox>
                                                        )
                                                    })}
                                                    <SoftButton color="info" onClick={() => {
                                                        arrayHelpers.push(emptyDescriptionBlock)
                                                    }}>
                                                        Add Description Block
                                                    </SoftButton>
                                                </div>
                                            )
                                        }}
                                    />
                                </Grid>
                                {extraRows?.(formik.isValid)}
                            </>
                        )}
                </Grid >
            </form >
        </FormikProvider >
    );
}

ExerciseEditForm.propTypes = {
    initialValues: exerciseShape,
    onSubmit: func.isRequired,
    header: node,
    extraRows: func,
}

export default ExerciseEditForm;
