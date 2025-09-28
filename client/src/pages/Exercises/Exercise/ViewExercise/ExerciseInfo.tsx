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
} from "@mui/material";
import { Exercise } from "../../../../api/quadcoachApi/domain";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { FormikProps, FieldArray, FieldArrayRenderProps } from "formik";
import { SoftInput, SoftTypography } from "../../../../components";
import { ExercisePartialId } from "../../../../api/quadcoachApi/domain";
import { useState, useMemo } from "react";
import { MaterialAutocomplete } from "../../../../components/ExerciseParts";
import { TagAutocomplete } from "../../../../components/ExerciseParts";
import { ExerciseAutocomplete } from "../../../../components/ExerciseParts";

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

  // Local state for selecting new related exercises (transient before adding to formik)
  const [selectedRelatedExercises, setSelectedRelatedExercises] = useState<
    Exercise[]
  >([]);
  // Cache of exercises added so their names are available even before API refetch updates relatedExercises prop
  const [cachedRelatedExercises, setCachedRelatedExercises] = useState<
    Exercise[]
  >([]);

  const relatedExercisesFromFormik = useMemo(() => {
    const ids = formik.values.related_to || [];

    // Gather map from available relatedExercises (query) plus any transient selected ones and cached ones
    const byId = new Map<string, Exercise>();
    relatedExercises?.forEach((ex) => byId.set(ex._id, ex));
    cachedRelatedExercises.forEach((ex) => {
      if (!byId.has(ex._id)) byId.set(ex._id, ex);
    });
    selectedRelatedExercises.forEach((ex) => {
      if (!byId.has(ex._id)) byId.set(ex._id, ex);
    });

    return ids
      .map((id) => {
        if (byId.has(id)) return byId.get(id)!;
        // Fallback minimal placeholder (will be replaced when query refetches after save)
        return {
          _id: id,
          name: id,
          time_min: 0,
          beaters: 0,
          chasers: 0,
          persons: 0,
          description_blocks: [],
        } as Exercise;
      })
      .filter(Boolean);
  }, [
    formik.values.related_to,
    relatedExercises,
    selectedRelatedExercises,
    cachedRelatedExercises,
  ]);

  return (
    <>
      <Card
        sx={{
          height: "100%",
          border: isEditMode ? "2px solid primary.main" : "none",
        }}
      >
        <CardHeader title={t("Exercise:info.title")} />
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
                  <ListItemText
                    primary={
                      isEditMode ? (
                        <SoftInput
                          error={
                            formik.touched.persons &&
                            Boolean(formik.errors.persons)
                          }
                          type="number"
                          value={formik.values.persons}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          name="persons"
                          placeholder={t("Exercise:info.personNumber")}
                          inputProps={{ min: 0 }}
                        />
                      ) : (
                        exercise.persons.toString()
                      )
                    }
                    secondary={t("Exercise:info.personNumber")}
                  />
                </ListItem>
              </Grid>

              {/* Beaters */}
              <Grid item xs={6} md={3}>
                <ListItem>
                  <ListItemText
                    primary={
                      isEditMode ? (
                        <SoftInput
                          error={
                            formik.touched.beaters &&
                            Boolean(formik.errors.beaters)
                          }
                          type="number"
                          value={formik.values.beaters}
                          onChange={(e) => {
                            formik.setFieldValue(
                              `beaters`,
                              parseInt(e.target.value) || 0,
                            );
                          }}
                          onBlur={formik.handleBlur}
                          name="beaters"
                          placeholder={t("Exercise:info.beaterNumber")}
                          inputProps={{ min: 0 }}
                        />
                      ) : (
                        exercise.beaters.toString()
                      )
                    }
                    secondary={t("Exercise:info.beaterNumber")}
                  />
                </ListItem>
              </Grid>

              {/* Chasers */}
              <Grid item xs={6} md={3}>
                <ListItem>
                  <ListItemText
                    primary={
                      isEditMode ? (
                        <SoftInput
                          error={
                            formik.touched.chasers &&
                            Boolean(formik.errors.chasers)
                          }
                          type="number"
                          value={formik.values.chasers}
                          onChange={(e) => {
                            formik.setFieldValue(
                              `chasers`,
                              parseInt(e.target.value) || 0,
                            );
                          }}
                          onBlur={formik.handleBlur}
                          name="chasers"
                          placeholder={t("Exercise:info.chaserNumber")}
                          inputProps={{ min: 0 }}
                        />
                      ) : (
                        exercise.chasers.toString()
                      )
                    }
                    secondary={t("Exercise:info.chaserNumber")}
                  />
                </ListItem>
              </Grid>

              {/* Time */}
              <Grid item xs={6} md={3}>
                <ListItem>
                  <ListItemText
                    primary={t("Exercise:info.minutesValue", {
                      value: exercise.time_min,
                    })}
                    secondary={t("Exercise:info.time")}
                  />
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
                          <SoftTypography variant="body2">
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
                          <SoftTypography variant="body2">
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
                  ) : (formik.values.related_to?.length ?? 0) > 0 ? (
                    // Fallback to show locally cached related exercises right after save before refetch
                    <List sx={{ width: "100%" }}>
                      {relatedExercisesFromFormik.map((relatedExercise) => (
                        <ListItem key={relatedExercise._id}>
                          <ListItemButton
                            onClick={() =>
                              handleOpenExerciseClick(relatedExercise._id)
                            }
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
                        {relatedExercisesFromFormik.map((relatedExercise) => (
                          <Chip
                            key={relatedExercise._id}
                            label={relatedExercise.name}
                            onDelete={() => {
                              const exerciseIdIndex =
                                formik.values.related_to?.findIndex(
                                  (id) => id === relatedExercise._id,
                                );
                              if (
                                exerciseIdIndex !== undefined &&
                                exerciseIdIndex !== -1
                              ) {
                                arrayHelpers.remove(exerciseIdIndex);
                              }
                            }}
                            deleteIcon={<DeleteIcon />}
                            sx={{ margin: "2px" }}
                            variant="outlined"
                          />
                        ))}
                        {relatedExercisesFromFormik.length === 0 && (
                          <SoftTypography variant="body2">
                            {t("Exercise:realtedToExercises.none")}
                          </SoftTypography>
                        )}
                      </div>

                      {/* Inline autocomplete for adding related exercises */}
                      <div style={{ marginBottom: 8 }}>
                        <ExerciseAutocomplete
                          selectedExercises={selectedRelatedExercises}
                          onExercisesSelectedChange={(newSelected) => {
                            setSelectedRelatedExercises(newSelected);
                            const currentIds = formik.values.related_to || [];
                            const newExercises = newSelected.filter(
                              (ex) => !currentIds.includes(ex._id),
                            );
                            if (newExercises.length > 0) {
                              const newIds = newExercises.map((ex) => ex._id);
                              formik.setFieldValue("related_to", [
                                ...currentIds,
                                ...newIds,
                              ]);
                              // Cache exercises for display even after clearing selection
                              setCachedRelatedExercises((prev) => {
                                const map = new Map(
                                  prev.map((e) => [e._id, e]),
                                );
                                newExercises.forEach((e) => {
                                  if (!map.has(e._id)) map.set(e._id, e);
                                });
                                return Array.from(map.values());
                              });
                              // Clear selection to allow adding more without manual deselect
                              setSelectedRelatedExercises([]);
                            }
                          }}
                          alreadyAddedExercises={relatedExercisesFromFormik}
                        />
                      </div>
                    </div>
                  )}
                />
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </>
  );
};

export default ExerciseInfo;
