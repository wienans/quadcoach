import { number, shape, string, func, node, array} from "prop-types";
import { FieldArray, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { Container, FormGroup, FormHelperText, Grid, InputAdornment, TextField } from "@mui/material";
import SoftTypography from "../SoftTypography";
import SoftInput from "../SoftInput";
import { SoftBox, SoftButton } from "..";
import { FlaskEmptyPlus } from "mdi-material-ui";

type descriptionBlockType = {
    description: string,
    video_url:string,
    coaching_points:string,
    time_min:number
}

type exerciseType = {
    name: string,
    description: string,
    videoUrl: string,
    timeMin: number,
    persons: number,
    beaters: number,
    chasers: number,
    materials: [string],
    tags: [string],
    descriptionBlocks: [descriptionBlockType],
    relatedTo: [string],
    materialsString: string, // should be replaced with use of the materials array
    tagsString: string, // should be replaced with use of the tags array
    relatedToString: string // should be replaced with use of the relatedTo array
}


const exerciseShape = shape({
    name: string,
    description: string,
    videoUrl: string,
    timeMin: number,
    persons: number,
    beaters: number,
    chasers: number,
    materials: array,
    tags: array,
    descriptionBlocks: array,
    relatedTo: array,
    materialsString: string, // should be replaced with use of the materials array
    tagsString: string, // should be replaced with use of the tags array
    relatedToString: string, // should be replaced with use of the relatedTo array
})

const emptyDescriptionBlock = {
    description: "",
    video_url:"",
    coaching_points:"",
    time_min:0
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
const ExerciseEditForm = ({ initialValues, onSubmit, extraRows, header: Header }) => {
    const formik = useFormik<exerciseType>({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            name: initialValues?.name ?? "",
            description: initialValues?.description ?? "",
            videoUrl: initialValues?.videoUrl ?? "",
            timeMin: initialValues?.timeMin ?? "",
            persons: initialValues?.persons ?? 0,
            beaters: initialValues?.beaters ?? "",
            chasers: initialValues?.chasers ?? "",
            materials: initialValues?.materials ?? [],
            tags: initialValues?.tags ?? [],
            descriptionBlocks: initialValues?.descriptionBlocks ?? [],
            relatedTo: initialValues?.relatedTo ?? [],
            materialsString: initialValues?.materialsString ?? "",
            tagsString: initialValues?.tagsString ?? "",
            relatedToString: initialValues?.relatedToString ?? "",
        },

        validationSchema: Yup.object({
            name: Yup.string().required("Please enter a name"),
            description: Yup.string(),
            videoUrl: Yup.string().url("Please enter a valid url"),
            timeMin: Yup.number(),
            persons: Yup.number(),
            beaters: Yup.number(),
            chasers: Yup.number(),
            materials: Yup.array().of(Yup.string()),
            tags: Yup.array().of(Yup.string()),
            descriptionBlocks: Yup.array().of(Yup.object({
                description: Yup.string().required("Please enter a description"),
                video_url: Yup.string().url("Please enter a valid url"),
                coaching_points: Yup.string(),
                timeMin: Yup.number(),
            })),
            relatedTo: Yup.array().of(Yup.string()),
            materialsString: Yup.string(),
            tagsString: Yup.string(),
            relatedToString: Yup.string(),
        }),

        onSubmit: (values) => {
            const { materialsString, tagsString, name, description, videoUrl, timeMin, persons, beaters, chasers, relatedToString, descriptionBlocks } = values
            let materials = materialsString.replace(/\s/g, '').split(',')
            let tags = tagsString.replace(/\s/g, '').split(',')
            let related_to = relatedToString.replace(/\s/g, '').split(',')
            related_to = related_to[0]==""?[]:related_to
            const calculate_persons = beaters+chasers
            const exercise = {
                name,
                description,
                video_url: videoUrl,
                time_min: timeMin,
                persons: persons > calculate_persons ? persons : calculate_persons,
                beaters,
                chasers,
                materials,
                tags,
                related_to,
                description_blocks: descriptionBlocks
            }
            onSubmit(exercise)
        },
    })

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
                        <Grid item xs={12}>
                            <SoftBox variant="contained"  shadow="lg" opacity={1} p={1} my={2} borderRadius="lg">
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
                                        <SoftTypography variant="body2">Material</SoftTypography>
                                        <SoftInput
                                            error={formik.touched.materialsString != null && Boolean(formik.errors.materialsString)}
                                            name="materialsString"
                                            id="outlined-basic"
                                            placeholder="Needed material"
                                            variant="outlined"
                                            value={formik.values.materialsString}
                                            onChange={formik.handleChange}
                                            fullWidth
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.materialsString && Boolean(formik.errors.materialsString) && <FormHelperText error>{formik.errors.materialsString}</FormHelperText>}
                                    </FormGroup>
                                </Grid>
                                <Grid item xs={12} p={1}>
                                    <FormGroup>
                                        <SoftTypography variant="body2">Tags</SoftTypography>
                                        <SoftInput
                                            error={formik.touched.tagsString != null && Boolean(formik.errors.tagsString)}
                                            name="tagsString"
                                            id="outlined-basic"
                                            placeholder="Tags for easy search"
                                            variant="outlined"
                                            value={formik.values.tagsString}
                                            onChange={formik.handleChange}
                                            fullWidth
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.tagsString && Boolean(formik.errors.tagsString) && <FormHelperText error>{formik.errors.tagsString}</FormHelperText>}
                                    </FormGroup>
                                </Grid>
                                <Grid item xs={12} p={1}>
                                    <FormGroup>
                                        <SoftTypography variant="body2">Related To:</SoftTypography>
                                        <SoftInput
                                            error={formik.touched.relatedToString != null && Boolean(formik.errors.relatedToString)}
                                            name="relatedToString"
                                            id="outlined-basic"
                                            placeholder="Related to"
                                            variant="outlined"
                                            value={formik.values.relatedToString}
                                            onChange={formik.handleChange}
                                            fullWidth
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.relatedToString && Boolean(formik.errors.relatedToString) && <FormHelperText error>{formik.errors.relatedToString}</FormHelperText>}
                                    </FormGroup>
                                </Grid>
                            </SoftBox>
                    </Grid>
                    <Grid item xs={12}>
                        <FieldArray
                            name="descriptionBlocks"
                            render={ (arrayHelpers) => {
                            return(
                                <div> 
                                    {formik.values.descriptionBlocks.map((_,index)=>{
                                        return(
                                            <SoftBox key={index} variant="contained" shadow="lg" opacity={1} p={1} my={2} borderRadius="lg">
                                                <SoftTypography variant="h5" fontWeight="bold" textTransform="uppercase">Block {index+1}</SoftTypography>
                                                <Grid item xs={12} p={1}>
                                                    <FormGroup>
                                                        <SoftTypography variant="body2">Video URL</SoftTypography>
                                                        <SoftInput
                                                            error={formik.touched.descriptionBlocks != null && formik.touched.descriptionBlocks[index] != null && formik.touched.descriptionBlocks[index].video_url != null && formik.errors.descriptionBlocks != null && formik.errors.descriptionBlocks[index] != null && Boolean(formik.errors.descriptionBlocks[index].video_url)}
                                                            name={`descriptionBlocks[${index}].video_url`}
                                                            id="outlined-basic"
                                                            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                                            variant="outlined"
                                                            value={formik.values.descriptionBlocks[index].video_url}
                                                            onChange={formik.handleChange}
                                                            fullWidth
                                                            multiline
                                                            onBlur={formik.handleBlur}
                                                        />
                                                        {formik.touched.descriptionBlocks && formik.touched.descriptionBlocks[index] != null && formik.touched.descriptionBlocks[index].video_url && formik.errors.descriptionBlocks != null && formik.errors.descriptionBlocks[index] != null && Boolean(formik.errors.descriptionBlocks[index].video_url) && <FormHelperText error>{formik.errors.descriptionBlocks[index].video_url}</FormHelperText>}
                                                    </FormGroup>
                                                </Grid>
                                                <Grid item xs={12} p={1}>
                                                    <FormGroup>
                                                        <SoftTypography variant="body2">Description</SoftTypography>
                                                        <SoftInput
                                                            error={formik.touched.descriptionBlocks != null && formik.touched.descriptionBlocks[index] != null && formik.touched.descriptionBlocks[index].description != null && formik.errors.descriptionBlocks != null && formik.errors.descriptionBlocks[index] != null && Boolean(formik.errors.descriptionBlocks[index].description)}
                                                            name={`descriptionBlocks[${index}].description`}
                                                            id="outlined-basic"
                                                            placeholder="Description"
                                                            variant="outlined"
                                                            value={formik.values.descriptionBlocks[index].description}
                                                            onChange={formik.handleChange}
                                                            fullWidth
                                                            multiline 
                                                            minRows={5}
                                                            onBlur={formik.handleBlur}
                                                        />
                                                        {formik.touched.descriptionBlocks && formik.touched.descriptionBlocks[index] != null && formik.touched.descriptionBlocks[index].description && formik.errors.descriptionBlocks != null && formik.errors.descriptionBlocks[index] != null && Boolean(formik.errors.descriptionBlocks[index].description) && <FormHelperText error>{formik.errors.descriptionBlocks[index].description}</FormHelperText>}
                                                    </FormGroup>
                                                </Grid>
                                                <Grid item xs={12} p={1}>
                                                    <FormGroup>
                                                        <SoftTypography variant="body2">Coaching Points</SoftTypography>
                                                        <SoftInput
                                                            error={formik.touched.descriptionBlocks != null && formik.touched.descriptionBlocks[index] != null && formik.touched.descriptionBlocks[index].coaching_points != null && formik.errors.descriptionBlocks != null && formik.errors.descriptionBlocks[index] != null && Boolean(formik.errors.descriptionBlocks[index].coaching_points)}
                                                            name={`descriptionBlocks[${index}].coaching_points`}
                                                            id="outlined-basic"
                                                            placeholder="Coaching Points"
                                                            variant="outlined"
                                                            value={formik.values.descriptionBlocks[index].coaching_points}
                                                            onChange={formik.handleChange}
                                                            fullWidth
                                                            multiline 
                                                            minRows={5}
                                                            onBlur={formik.handleBlur}
                                                        />
                                                        {formik.touched.descriptionBlocks && formik.touched.descriptionBlocks[index] != null && formik.touched.descriptionBlocks[index].coaching_points && formik.errors.descriptionBlocks != null && formik.errors.descriptionBlocks[index] != null && Boolean(formik.errors.descriptionBlocks[index].coaching_points) && <FormHelperText error>{formik.errors.descriptionBlocks[index].coaching_points}</FormHelperText>}
                                                    </FormGroup>
                                                </Grid>
                                                <Grid item xs={12} p={1}>
                                                    <FormGroup>
                                                        <SoftTypography variant="body2">Suggested Time (Minutes)</SoftTypography>
                                                        <SoftInput
                                                            type="number"
                                                            inputProps={{ min: 0, step: "1" }}
                                                            error={formik.touched.descriptionBlocks != null && formik.touched.descriptionBlocks[index] != null &&formik.touched.descriptionBlocks[index].time_min != null && formik.errors.descriptionBlocks != null && formik.errors.descriptionBlocks[index] != null && Boolean(formik.errors.descriptionBlocks[index].time_min)}
                                                            name={`descriptionBlocks[${index}].time_min`}
                                                            id="outlined-basic"
                                                            placeholder="Minutes"
                                                            variant="outlined"
                                                            value={formik.values.descriptionBlocks[index].time_min}
                                                            onChange={formik.handleChange}
                                                            fullWidth
                                                            onBlur={formik.handleBlur}
                                                        />
                                                        {formik.touched.descriptionBlocks != null && formik.touched.descriptionBlocks[index] != null && formik.touched.descriptionBlocks[index].time_min && formik.errors.descriptionBlocks != null && formik.errors.descriptionBlocks[index] != null && Boolean(formik.errors.descriptionBlocks[index].time_min) && <FormHelperText error>{formik.errors.descriptionBlocks[index].time_min}</FormHelperText>}
                                                    </FormGroup>
                                                </Grid>
                                                <SoftButton  color="error" onClick={() => {
                                                    arrayHelpers.remove(index)
                                                }}> 
                                                    Remove Block
                                                </SoftButton>
                                            </SoftBox>
                                        )
                                    })}
                                    <SoftButton  color="info" onClick={() => {
                                        arrayHelpers.push(emptyDescriptionBlock)
                                    }}> 
                                        Add Description Block
                                    </SoftButton>
                                </div>)    
                            }}
                        />
                    </Grid>
                    {extraRows(formik.isValid)}
                </Grid>
            </form>
        </FormikProvider>
    );
}

ExerciseEditForm.propTypes = {
    initialValues: exerciseShape,
    onSubmit: func.isRequired,
    header: node,
    extraRows: func,
}

export default ExerciseEditForm;
