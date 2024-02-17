import "./translations";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Alert,
  Card,
  Grid,
  Skeleton,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Theme,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  BottomNavigationAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListItemButton,
  CardActions,
} from "@mui/material";
import { SoftBox, SoftButton } from "../../../../components";
import ReactPlayer from "react-player";
import { Exercise } from "../../../../api/quadcoachApi/domain";
import {
  useDeleteExerciseMutation,
  useGetExerciseQuery,
  useGetRelatedExercisesQuery,
} from "../../../exerciseApi";
import { useTranslation } from "react-i18next";
import { ProfileLayout } from "../../../../components/LayoutContainers";
import { getExerciseTypeHeaderBackgroundImage } from "../../../../components/LayoutContainers/ProfileLayout";
import {
  ExerciseType,
  getExerciseType,
} from "../../../../helpers/exerciseHelpers";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";

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

const Exercise = () => {
  const { t } = useTranslation("Exercise");
  const { id: exerciseId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const isUpXl = useMediaQuery((theme: Theme) => theme.breakpoints.up("xl"));
  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  const {
    data: exercise,
    isLoading: isExerciseLoading,
    isError: isExerciseError,
  } = useGetExerciseQuery(exerciseId || "", {
    skip: exerciseId == null,
  });

  const {
    data: relatedExercises,
    isLoading: isRelatedExercisesLoading,
    isError: isRelatedExercisesError,
  } = useGetRelatedExercisesQuery(exerciseId || "", {
    skip: exerciseId == null,
  });

  const [exerciseType, setExerciseType] = useState<ExerciseType | undefined>();
  const [headerBackgroundImage, setHeaderBackgroundImage] = useState<
    string | undefined
  >();

  useEffect(() => {
    setExerciseType(exercise ? getExerciseType(exercise) : undefined);
  }, [exercise]);

  useEffect(() => {
    setHeaderBackgroundImage(
      exerciseType && exercise
        ? getExerciseTypeHeaderBackgroundImage(exerciseType, theme)
        : undefined,
    );
  }, [exercise, exerciseType, theme]);

  const update = async () => {
    navigate(`/exercises/${exerciseId}/update`);
  };

  const [
    deleteExercise,
    {
      isError: isDeleteExerciseError,
      isLoading: isDeleteExerciseLoading,
      isSuccess: isDeleteExerciseSuccess,
    },
  ] = useDeleteExerciseMutation();
  const onDeleteExerciseClick = () => {
    if (!exercise) return;
    deleteExercise(exercise._id);
  };
  useEffect(() => {
    if (!isDeleteExerciseSuccess) return;
    navigate("/");
  }, [isDeleteExerciseSuccess, navigate]);

  const handleChipClick = (id: string) => {
    navigate(`/exercises/${id}`);
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
    );
  }

  if (!exercise || isExerciseError) {
    return <Alert color="error">{t("Exercise:errorLoadingExercise")}</Alert>;
  }

  return (
    <ProfileLayout
      title={exercise?.name}
      headerBackgroundImage={headerBackgroundImage}
      isDataLoading={isExerciseLoading}
      headerAction={
        <SoftBox display="flex">
          {isUpXl ? (
            <>
              <SoftButton onClick={update} color="primary" sx={{ mr: 1 }}>
                {t("Exercise:updateExercise")}
              </SoftButton>
              <SoftButton
                onClick={onDeleteExerciseClick}
                color="error"
                disabled={!exercise || isDeleteExerciseLoading}
              >
                {t("Exercise:deleteExercise")}
              </SoftButton>
            </>
          ) : (
            isUpMd && (
              <>
                <Tooltip title={t("Exercise:updateExercise")}>
                  <IconButton onClick={update} color="primary" sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("Exercise:deleteExercise")}>
                  <IconButton
                    onClick={onDeleteExerciseClick}
                    color="error"
                    disabled={!exercise || isDeleteExerciseLoading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </>
            )
          )}
        </SoftBox>
      }
      showScrollToTopButton={(scrollTrigger) => scrollTrigger && isUpMd}
      bottomNavigation={
        !isUpMd && (
          <>
            <Tooltip title={t("Exercise:updateExercise")}>
              <BottomNavigationAction icon={<EditIcon />} onClick={update} />
            </Tooltip>
            <Tooltip title={t("Exercise:deleteExercise")}>
              <BottomNavigationAction
                icon={<DeleteIcon />}
                onClick={onDeleteExerciseClick}
                disabled={!exercise || isDeleteExerciseLoading}
              />
            </Tooltip>
          </>
        )
      }
    >
      {() => (
        <>
          {isDeleteExerciseError && (
            <Alert color="error" sx={{ mt: 5, mb: 3 }}>
              {t("Exercise:errorDeletingExercise")}
            </Alert>
          )}
          {isRelatedExercisesError && (
            <Alert color="error" sx={{ mt: 5, mb: 3 }}>
              {t("Exercise:errorLoadingRelatedExercises")}
            </Alert>
          )}
          <Card sx={{ height: "100%" }}>
            <CardHeader title={t("Exercise:info.title")} />
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
                              handleChipClick(relatedExercise._id);
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
          {exercise.description_blocks?.map((el, index) => {
            return (
              <Card sx={{ my: 3, display: "flex" }} key={el._id}>
                <CardHeader
                  title={t("Exercise:block.title", { blockNumber: index + 1 })}
                  subheader={t("Exercise:block.minutes", {
                    minutes: el.time_min,
                  })}
                  sx={{
                    pb: 0,
                  }}
                />
                {el.video_url != "" && (
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      Video
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        position: "relative",
                        minHeight: "160px",
                      }}
                    >
                      <ReactPlayer
                        style={{ position: "absolute", left: 0, top: 0 }}
                        url={el.video_url}
                        width="100%"
                        height="100%"
                        controls
                        light
                      />
                    </AccordionDetails>
                  </Accordion>
                )}
                {el.description && el.description != "" && (
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      {t("Exercise:block.description")}
                    </AccordionSummary>
                    <AccordionDetails>{el.description}</AccordionDetails>
                  </Accordion>
                )}
                {el.coaching_points && el.coaching_points != "" && (
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      {t("Exercise:block.coachingPoints")}
                    </AccordionSummary>
                    <AccordionDetails>{el.coaching_points}</AccordionDetails>
                  </Accordion>
                )}
                {el.tactics_board && el.tactics_board != "" && (
                  <CardActions disableSpacing>
                    <IconButton href={`/tacticboards/${el.tactics_board}`}>
                      <ContentPasteIcon />
                    </IconButton>
                  </CardActions>
                )}
              </Card>
            );
          })}
        </>
      )}
    </ProfileLayout>
  );
};

export default Exercise;
