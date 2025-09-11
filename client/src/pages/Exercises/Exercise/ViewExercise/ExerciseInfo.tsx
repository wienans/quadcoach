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
} from "@mui/material";
import { Exercise } from "../../../../api/quadcoachApi/domain";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";

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
};

const ExerciseInfo = ({
  exercise,
  isRelatedExercisesLoading,
  relatedExercises,
  handleOpenExerciseClick,
  isEditMode = false,
}: ExerciseInfoProps): JSX.Element => {
  const { t } = useTranslation("Exercise");

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
              {personValues.map(({ labelResourceKey, getValue }) => (
                <Grid item xs={6} md={3} key={labelResourceKey}>
                  <ListItem>
                    <ListItemText
                      primary={getValue(exercise)}
                      secondary={t(labelResourceKey)}
                    />
                  </ListItem>
                </Grid>
              ))}
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
        <Grid item xs={12} lg={4}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {t("Exercise:materials.title")}
            </AccordionSummary>
            <AccordionDetails>
              {exercise.materials?.some((el) => el !== "") ? (
                <List
                  sx={{
                    width: "100%",
                  }}
                >
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
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {t("Exercise:tags.title")}
            </AccordionSummary>
            <AccordionDetails>
              {exercise.tags?.some((el) => el !== "") ? (
                <List
                  sx={{
                    width: "100%",
                  }}
                >
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
