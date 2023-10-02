import { number, shape, string, func, node } from "prop-types";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Container, FormGroup, FormHelperText, Grid, InputAdornment, TextField } from "@mui/material";
import SoftTypography from "../SoftTypography";
import SoftInput from "../SoftInput";

const exerciseShape = shape({
    name: string,
    description: string,
    videoUrl: string,
    timeMin: number,
    persons: number,
    materialsString: string,
    tagsString: string,
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
            persons: initialValues?.persons ?? "",
            materialsString: initialValues?.materialsString ?? "",
            tagsString: initialValues?.tagsString ?? "",
        },

        validationSchema: Yup.object({
            name: Yup.string().required("Please enter a name"),
            description: Yup.string().required("Please enter a description"),
            videoUrl: Yup.string().url("Please enter a valid url"),
            timeMin: Yup.number(),
            persons: Yup.number(),
            materialsString: Yup.string(),
            tagsString: Yup.string(),
        }),

        onSubmit: (values) => {
            const { materialsString, tagsString, name, description, videoUrl, timeMin, persons } = values
            const materials = materialsString.replace(/\s/g, '').split(',')
            const tags = tagsString.replace(/\s/g, '').split(',')

            const exercise = {
                name,
                description,
                video_url: videoUrl,
                time_min: timeMin,
                persons,
                materials,
                tags
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
            <Container fixed>
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
                                placeholder="Minutes"
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
                    {extraRows(isValid)}
                </Grid>
            </Container>
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
