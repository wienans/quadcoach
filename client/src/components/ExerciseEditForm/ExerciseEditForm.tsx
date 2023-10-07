import { number, shape, string, func, node, array} from "prop-types";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Container, FormGroup, FormHelperText, Grid, InputAdornment, TextField } from "@mui/material";
import SoftTypography from "../SoftTypography";
import SoftInput from "../SoftInput";
import { SoftBox } from "..";

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
})

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
    const { handleSubmit, errors, touched, handleBlur, handleChange, values, isValid } = useFormik({
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
            description: Yup.string().required("Please enter a description"),
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
            const { materialsString, tagsString, name, description, videoUrl, timeMin, persons, beaters, chasers, relatedToString } = values
            const materials = materialsString.replace(/\s/g, '').split(',')
            const tags = tagsString.replace(/\s/g, '').split(',')
            const related_to = relatedToString.replace(/\s/g, '').split(',')
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
                related_to
            }
            onSubmit(exercise)
        },
    })

    return (
        <form onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            handleSubmit()
            return false
        }}>
            <Grid container spacing={2}>
                {Header && <Grid item xs={12}>
                    {Header}
                </Grid>}
                <Grid item xs={12}>
                    <FormGroup>
                        <SoftTypography variant="body2">Name</SoftTypography>
                        <SoftInput
                            error={touched.name && Boolean(errors.name)}
                            name="name"
                            required
                            id="outlined-basic"
                            placeholder="Name"
                            variant="outlined"
                            value={values.name}
                            onChange={handleChange}
                            fullWidth
                            onBlur={handleBlur}
                        />
                        {touched.name && Boolean(errors.name) && <FormHelperText error>{errors.name}</FormHelperText>}
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <FormGroup>
                        <SoftTypography variant="body2">Description</SoftTypography>
                        <SoftInput
                            error={touched.description && Boolean(errors.description)}
                            name="description"
                            required
                            id="outlined-basic"
                            placeholder="Description"
                            variant="outlined"
                            value={values.description}
                            onChange={handleChange}
                            fullWidth
                            multiline 
                            minRows={5}
                            onBlur={handleBlur}
                        />
                        {touched.description && Boolean(errors.description) && <FormHelperText error>{errors.description}</FormHelperText>}
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <FormGroup>
                        <SoftTypography variant="body2">Video URL</SoftTypography>
                        <SoftInput
                            error={touched.videoUrl && Boolean(errors.videoUrl)}
                            name="videoUrl"
                            id="outlined-basic"
                            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            variant="outlined"
                            value={values.videoUrl}
                            onChange={handleChange}
                            fullWidth
                            onBlur={handleBlur}
                        />
                        {touched.videoUrl && Boolean(errors.videoUrl) && <FormHelperText error>{errors.videoUrl}</FormHelperText>}
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <FormGroup>
                        <SoftTypography variant="body2">Suggested Time (Minutes)</SoftTypography>
                        <SoftInput
                            type="number"
                            inputProps={{ min: 0, step: "1" }}
                            error={touched.timeMin != null && Boolean(errors.timeMin)}
                            name="timeMin"
                            id="outlined-basic"
                            placeholder="Minutes"
                            variant="outlined"
                            value={values.timeMin}
                            onChange={handleChange}
                            fullWidth
                            onBlur={handleBlur}
                        />
                        {touched.timeMin && Boolean(errors.timeMin) && <FormHelperText error>{errors.timeMin}</FormHelperText>}
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <FormGroup>
                        <SoftTypography variant="body2">Person amount</SoftTypography>
                        <SoftInput
                            type="number"
                            inputProps={{ min: 0, step: "1" }}
                            error={touched.persons != null && Boolean(errors.persons)}
                            name="persons"
                            required
                            id="outlined-basic"
                            placeholder="Persons"
                            variant="outlined"
                            value={values.persons}
                            onChange={handleChange}
                            fullWidth
                            onBlur={handleBlur}
                        />
                        {touched.persons != null && Boolean(errors.persons) && <FormHelperText error>{errors.persons}</FormHelperText>}
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <FormGroup>
                        <SoftTypography variant="body2">Chaser amount</SoftTypography>
                        <SoftInput
                            type="number"
                            inputProps={{ min: 0, step: "1" }}
                            error={touched.chasers != null && Boolean(errors.chasers)}
                            name="chasers"
                            required
                            id="outlined-basic"
                            placeholder="Chaser"
                            variant="outlined"
                            value={values.chasers}
                            onChange={handleChange}
                            fullWidth
                            onBlur={handleBlur}
                        />
                        {touched.chasers != null && Boolean(errors.chasers) && <FormHelperText error>{errors.chasers}</FormHelperText>}
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <FormGroup>
                        <SoftTypography variant="body2">Beater amount</SoftTypography>
                        <SoftInput
                            type="number"
                            inputProps={{ min: 0, step: "1" }}
                            error={touched.beaters != null && Boolean(errors.beaters)}
                            name="beaters"
                            required
                            id="outlined-basic"
                            placeholder="Beater"
                            variant="outlined"
                            value={values.beaters}
                            onChange={handleChange}
                            fullWidth
                            onBlur={handleBlur}
                        />
                        {touched.beaters != null && Boolean(errors.beaters) && <FormHelperText error>{errors.beaters}</FormHelperText>}
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <FormGroup>
                        <SoftTypography variant="body2">Material</SoftTypography>
                        <SoftInput
                            error={touched.materialsString != null && Boolean(errors.materialsString)}
                            name="materialsString"
                            id="outlined-basic"
                            placeholder="Needed material"
                            variant="outlined"
                            value={values.materialsString}
                            onChange={handleChange}
                            fullWidth
                            onBlur={handleBlur}
                        />
                        {touched.materialsString && Boolean(errors.materialsString) && <FormHelperText error>{errors.materialsString}</FormHelperText>}
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <FormGroup>
                        <SoftTypography variant="body2">Tags</SoftTypography>
                        <SoftInput
                            error={touched.tagsString != null && Boolean(errors.tagsString)}
                            name="tagsString"
                            id="outlined-basic"
                            placeholder="Tags for easy search"
                            variant="outlined"
                            value={values.tagsString}
                            onChange={handleChange}
                            fullWidth
                            onBlur={handleBlur}
                        />
                        {touched.tagsString && Boolean(errors.tagsString) && <FormHelperText error>{errors.tagsString}</FormHelperText>}
                    </FormGroup>
                </Grid>
                <Grid item xs={12}>
                    <FormGroup>
                        <SoftTypography variant="body2">Related To:</SoftTypography>
                        <SoftInput
                            error={touched.relatedToString != null && Boolean(errors.relatedToString)}
                            name="relatedToString"
                            id="outlined-basic"
                            placeholder="Related to"
                            variant="outlined"
                            value={values.relatedToString}
                            onChange={handleChange}
                            fullWidth
                            onBlur={handleBlur}
                        />
                        {touched.relatedToString && Boolean(errors.relatedToString) && <FormHelperText error>{errors.relatedToString}</FormHelperText>}
                    </FormGroup>
                </Grid>
                {/* <Grid item xs={12}>
                    {values.descriptionBlocks.map((el,index)=>{
                        return(
                            <SoftBox key={index} variant="contained" shadow="lg" opacity={1} p={1} my={2} borderRadius="lg">
                                <Grid item xs={12}>
                                    <FormGroup>
                                        <SoftTypography variant="body2">Description</SoftTypography>
                                        <SoftInput
                                            error={touched.descriptionBlocks != null && Boolean(errors.descriptionBlocks)}
                                            name="descriptionBlocks"
                                            id="outlined-basic"
                                            placeholder="Tags for easy search"
                                            variant="outlined"
                                            value={el.description}
                                            onChange={handleChange}
                                            fullWidth
                                            multiline
                                            onBlur={handleBlur}
                                        />
                                        {touched.descriptionBlocks && Boolean(errors.descriptionBlocks) && <FormHelperText error>{errors.descriptionBlocks}</FormHelperText>}
                                    </FormGroup>
                                </Grid>
                            </SoftBox>
                        )
                    })}

                </Grid> */}
                {extraRows(isValid)}
            </Grid>
        </form>
    );
}

ExerciseEditForm.propTypes = {
    initialValues: exerciseShape,
    onSubmit: func.isRequired,
    header: node,
    extraRows: func,
}

export default ExerciseEditForm;
