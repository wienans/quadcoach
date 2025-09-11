import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Skeleton,
  Chip,
  Button,
  IconButton,
} from "@mui/material";
import { Exercise } from "../../../../api/quadcoachApi/domain";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { FormikProps, FieldArray, FieldArrayRenderProps } from "formik";
import { SoftInput, SoftTypography } from "../../../../components";
import { ExercisePartialId } from "../../../../api/quadcoachApi/domain";
import { useState } from "react";

type ExerciseValue = {
  labelResourceKey: string;
  getValue: (exercise: Exercise) => string;
};

const personValues: ExerciseValue[] = [
  {
    labelResourceKey: "Exercise:info.personNumber",
    getValue: (exercise) => exercise.persons.toString(),
  },
  {
    labelResourceKey: "Exercise:info.beaterNumber",
    getValue: (exercise) => exercise.beaters.toString(),
  },
  {
    labelResourceKey: "Exercise:info.chaserNumber",
    getValue: (exercise) => exercise.chasers.toString(),
  },
];

export type ExerciseInfoProps = {
  exercise: Exercise;
  isRelatedExercisesLoading: boolean;
  relatedExercises: Exercise[] | undefined;
  handleOpenExerciseClick: (exerciseId: string) => void;
  isEditMode?: boolean;
  formik: FormikProps<ExercisePartialId>;
};

const ExerciseInfo = ({
  exercise,
  isRelatedExercisesLoading,
  relatedExercises,
  handleOpenExerciseClick,
  isEditMode = false,
  formik,
}: ExerciseInfoProps): JSX.Element => {
  const { t } = useTranslation("Exercise");
  
  // State for adding new items
  const [newMaterial, setNewMaterial] = useState("");
  const [newTag, setNewTag] = useState("");

  return (
    <>
      <Card sx={{ height: "100%", border: isEditMode ? "2px solid primary.main" : "none" }}>
        <CardHeader 
          title={
            isEditMode 
              ? `${t("Exercise:info.title")} (${t("Exercise:editMode")})`
              : t("Exercise:info.title")
          }
        />
        <CardContent>
          <List
            sx={{
              width: "100%",
            }}
          >
            <Grid container spacing={2}>
              {/* Persons */}
              <Grid item xs={6} md={3}>
                <ListItem>
                  {isEditMode ? (
                    <SoftInput
                      type="number"
                      value={formik.values.persons}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      name="persons"
                      placeholder={t("Exercise:info.personNumber")}
                      inputProps={{ min: 0 }}
                    />
                  ) : (
                    <ListItemText
                      primary={exercise.persons.toString()}
                      secondary={t("Exercise:info.personNumber")}
                    />
                  )}
                </ListItem>
              </Grid>
              
              {/* Beaters */}
              <Grid item xs={6} md={3}>
                <ListItem>
                  {isEditMode ? (
                    <SoftInput
                      type="number"
                      value={formik.values.beaters}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      name="beaters"
                      placeholder={t("Exercise:info.beaterNumber")}
                      inputProps={{ min: 0 }}
                    />
                  ) : (
                    <ListItemText
                      primary={exercise.beaters.toString()}
                      secondary={t("Exercise:info.beaterNumber")}
                    />
                  )}
                </ListItem>
              </Grid>
              
              {/* Chasers */}
              <Grid item xs={6} md={3}>
                <ListItem>
                  {isEditMode ? (
                    <SoftInput
                      type="number"
                      value={formik.values.chasers}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      name="chasers"
                      placeholder={t("Exercise:info.chaserNumber")}
                      inputProps={{ min: 0 }}
                    />
                  ) : (
                    <ListItemText
                      primary={exercise.chasers.toString()}
                      secondary={t("Exercise:info.chaserNumber")}
                    />
                  )}
                </ListItem>
              </Grid>
              
              {/* Time */}
              <Grid item xs={6} md={3}>
                <ListItem>
                  {isEditMode ? (
                    <SoftInput
                      type="number"
                      value={formik.values.time_min}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      name="time_min"
                      placeholder={t("Exercise:info.time")}
                      inputProps={{ min: 0 }}
                    />
                  ) : (
                    <ListItemText
                      primary={t("Exercise:info.minutesValue", {
                        value: exercise.time_min,
                      })}
                      secondary={t("Exercise:info.time")}
                    />
                  )}
                </ListItem>
              </Grid>
            </Grid>
          </List>
        </CardContent>
      </Card>
      <Grid container spacing={2} sx={{ my: 3 }}>
        {/* Materials Accordion */}
        <Grid item xs={12} lg={4}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {t("Exercise:materials.title")}
            </AccordionSummary>
            <AccordionDetails>
              {!isEditMode ? (
                // View mode
                exercise.materials?.some((el) => el !== "") ? (
                  <List sx={{ width: "100%" }}>
                    {exercise.materials
                      .filter((el) => el !== "")
                      .map((el, index) => (
                        <ListItem key={el + index}>
                          <ListItemText primary={el} />
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  t("Exercise:materials.none")
                )
              ) : (
                // Edit mode
                <FieldArray
                  name="materials"
                  render={(arrayHelpers: FieldArrayRenderProps) => (
                    <div>
                      {/* Display existing materials as chips */}
                      <div style={{ marginBottom: 16 }}>
                        {formik.values.materials?.map((material, index) => {
                          if (material !== "") {
                            return (
                              <Chip
                                key={material + index}
                                label={material}
                                onDelete={() => arrayHelpers.remove(index)}
                                deleteIcon={<DeleteIcon />}
                                sx={{ margin: "2px" }}
                                variant="outlined"
                              />
                            );
                          }
                          return null;
                        })}
                        {formik.values.materials?.length === 0 && (
                          <SoftTypography variant="body2" color="textSecondary">
                            {t("Exercise:materials.none")}
                          </SoftTypography>
                        )}
                      </div>
                      
                      {/* Add new material */}
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <SoftInput
                          placeholder={t("Exercise:materials.addNew")}
                          value={newMaterial}
                          onChange={(e) => setNewMaterial(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && newMaterial.trim()) {
                              arrayHelpers.push(newMaterial.trim());
                              setNewMaterial("");
                            }
                          }}
                        />
                        <IconButton
                          onClick={() => {
                            if (newMaterial.trim()) {
                              arrayHelpers.push(newMaterial.trim());
                              setNewMaterial("");
                            }
                          }}
                          disabled={!newMaterial.trim()}
                        >
                          <AddIcon />
                        </IconButton>
                      </div>
                    </div>
                  )}
                />
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Tags Accordion */}
        <Grid item xs={12} lg={4}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {t("Exercise:tags.title")}
            </AccordionSummary>
            <AccordionDetails>
              {!isEditMode ? (
                // View mode
                exercise.tags?.some((el) => el !== "") ? (
                  <List sx={{ width: "100%" }}>
                    {exercise.tags
                      .filter((el) => el !== "")
                      .map((el, index) => (
                        <ListItem key={el + index}>
                          <ListItemText primary={el} />
                        </ListItem>
                      ))}
                  </List>
                ) : (
                  t("Exercise:tags.none")
                )
              ) : (
                // Edit mode
                <FieldArray
                  name="tags"
                  render={(arrayHelpers: FieldArrayRenderProps) => (
                    <div>
                      {/* Display existing tags as chips */}
                      <div style={{ marginBottom: 16 }}>
                        {formik.values.tags?.map((tag, index) => {
                          if (tag !== "") {
                            return (
                              <Chip
                                key={tag + index}
                                label={tag}
                                onDelete={() => arrayHelpers.remove(index)}
                                deleteIcon={<DeleteIcon />}
                                sx={{ margin: "2px" }}
                                variant="outlined"
                              />
                            );
                          }
                          return null;
                        })}
                        {formik.values.tags?.length === 0 && (
                          <SoftTypography variant="body2" color="textSecondary">
                            {t("Exercise:tags.none")}
                          </SoftTypography>
                        )}
                      </div>
                      
                      {/* Add new tag */}
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <SoftInput
                          placeholder={t("Exercise:tags.addNew")}
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter" && newTag.trim()) {
                              arrayHelpers.push(newTag.trim());
                              setNewTag("");
                            }
                          }}
                        />
                        <IconButton
                          onClick={() => {
                            if (newTag.trim()) {
                              arrayHelpers.push(newTag.trim());
                              setNewTag("");
                            }
                          }}
                          disabled={!newTag.trim()}
                        >
                          <AddIcon />
                        </IconButton>
                      </div>
                    </div>
                  )}
                />
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {t("Exercise:realtedToExercises.title")}
            </AccordionSummary>
            <AccordionDetails>
              {isRelatedExercisesLoading ? (
                <List
                  sx={{
                    width: "100%",
                  }}
                >
                  {Array.from(Array(5).keys()).map((k) => (
                    <ListItem key={k}>
                      <ListItemText
                        primary={<Skeleton variant="text" width="100%" />}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (relatedExercises?.length ?? 0) > 0 ? (
                <List
                  sx={{
                    width: "100%",
                  }}
                >
                  {relatedExercises?.map((relatedExercise) => (
                    <ListItem key={relatedExercise._id}>
                      <ListItemButton
                        onClick={() => {
                          handleOpenExerciseClick(relatedExercise._id);
                        }}
                      >
                        <ListItemText primary={relatedExercise.name} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                t("Exercise:realtedToExercises.none")
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </>
  );
};

export default ExerciseInfo;
