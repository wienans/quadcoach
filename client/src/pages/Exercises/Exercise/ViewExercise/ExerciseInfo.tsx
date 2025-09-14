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
import MaterialAutocomplete from "../../../../components/ExerciseEditForm/AddMaterialDialog/MaterialAutocomplete";
import TagAutocomplete from "../../../../components/ExerciseEditForm/AddTagDialog/TagAutocomplete";
import AddRelatedExercisesDialog from "../../../../components/ExerciseEditForm/AddRelatedExercisesDialog/AddRelatedExercisesDialog";

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
  
  // State for managing related exercises dialog
  const [isRelatedExercisesDialogOpen, setIsRelatedExercisesDialogOpen] = useState(false);

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
                      
                      {/* Material autocomplete */}
                      <MaterialAutocomplete
                        selectedMaterials={[]}
                        onMaterialSelectedChange={(selectedMaterials) => {
                          selectedMaterials.forEach((material) => {
                            if (!formik.values.materials?.includes(material)) {
                              arrayHelpers.push(material);
                            }
                          });
                        }}
                        alreadyAddedMaterials={formik.values.materials || []}
                      />
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
                      
                      {/* Tag autocomplete */}
                      <TagAutocomplete
                        selectedTags={[]}
                        onTagSelectedChange={(selectedTags) => {
                          selectedTags.forEach((tag) => {
                            if (!formik.values.tags?.includes(tag)) {
                              arrayHelpers.push(tag);
                            }
                          });
                        }}
                        alreadyAddedTags={formik.values.tags || []}
                      />
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
              {!isEditMode ? (
                // View mode
                <>
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
                </>
              ) : (
                // Edit mode
                <FieldArray
                  name="related_to"
                  render={(arrayHelpers: FieldArrayRenderProps) => (
                    <div>
                      {/* Display existing related exercises as chips */}
                      <div style={{ marginBottom: 16 }}>
                        {relatedExercises?.map((relatedExercise, index) => (
                          <Chip
                            key={relatedExercise._id}
                            label={relatedExercise.name}
                            onDelete={() => {
                              const exerciseIdIndex = formik.values.related_to?.findIndex(id => id === relatedExercise._id);
                              if (exerciseIdIndex !== undefined && exerciseIdIndex !== -1) {
                                arrayHelpers.remove(exerciseIdIndex);
                              }
                            }}
                            deleteIcon={<DeleteIcon />}
                            sx={{ margin: "2px" }}
                            variant="outlined"
                          />
                        ))}
                        {(!relatedExercises || relatedExercises.length === 0) && (
                          <SoftTypography variant="body2" color="textSecondary">
                            {t("Exercise:realtedToExercises.none")}
                          </SoftTypography>
                        )}
                      </div>
                      
                      {/* Add related exercises button */}
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => setIsRelatedExercisesDialogOpen(true)}
                      >
                        {t("Exercise:realtedToExercises.add")}
                      </Button>
                    </div>
                  )}
                />
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
      
      {/* Add Related Exercises Dialog */}
      <AddRelatedExercisesDialog
        isOpen={isRelatedExercisesDialogOpen}
        onConfirm={(selectedExercises) => {
          if (selectedExercises) {
            const currentRelatedIds = formik.values.related_to || [];
            const newIds = selectedExercises
              .map(ex => ex._id)
              .filter(id => !currentRelatedIds.includes(id));
            
            formik.setFieldValue('related_to', [...currentRelatedIds, ...newIds]);
          }
          setIsRelatedExercisesDialogOpen(false);
        }}
        alreadyAddedExercises={relatedExercises || []}
      />
    </>
  );
};

export default ExerciseInfo;
