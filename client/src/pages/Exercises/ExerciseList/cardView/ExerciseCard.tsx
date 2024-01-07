import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  IconButton,
  IconButtonProps,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  styled,
} from "@mui/material";
import ExerciseAvatar from "./ExerciseAvatar";
import CircleIcon from "@mui/icons-material/Circle";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PeopleIcon from "@mui/icons-material/People";
import { SoftBox, SoftButton, SoftTypography } from "../../../../components";
import TagIcon from "@mui/icons-material/Tag";
import { Cone, Head, RelationOneToMany } from "mdi-material-ui";
import ReactPlayer from "react-player";
import {
  ExerciseType,
  getExerciseType,
} from "../../../../helpers/exerciseHelpers";
import { Exercise } from "../../../../api/quadcoachApi/domain";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const iconButtonProps: ExpandMoreProps = { ...props };
  delete (iconButtonProps as { expand?: boolean }).expand;
  return <IconButton {...iconButtonProps} />;
})<ExpandMoreProps>(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export type ExerciseCardProps = {
  exercise: Exercise;
  onOpenExerciseClick: () => void;
};

const ExerciseCard = ({
  exercise,
  onOpenExerciseClick,
}: ExerciseCardProps): JSX.Element => {
  const { t } = useTranslation("ExerciseList");
  const [moreInformationExpanded, setMoreInformationExpanded] =
    useState<boolean>(false);
  // TODO: Maybe we should add to exercise a picture or video url, which could be used to show exercise.
  // For now check if there is one block with video url
  const availableVideoUrl = exercise.description_blocks.find(
    (block) => block.video_url != null && block.video_url !== "",
  )?.video_url;
  const exerciseType = getExerciseType(exercise);

  return (
    <Card>
      <CardHeader
        sx={{
          display: "flex",
          overflow: "hidden",
          "& .MuiCardHeader-content": {
            overflow: "hidden",
          },
        }}
        avatar={
          <ExerciseAvatar exercise={exercise} exerciseType={exerciseType} />
        }
        title={exercise.name}
        titleTypographyProps={{ noWrap: true }}
      />
      <CardContent sx={{ height: "194px", position: "relative" }}>
        {availableVideoUrl != null ? (
          <ReactPlayer
            url={availableVideoUrl}
            width="100%"
            height="100%"
            controls
            light
          />
        ) : (
          <SoftBox
            width="100%"
            height="100%"
            sx={(theme) => ({
              bgcolor: theme.palette.grey[300],
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
            })}
          >
            {[ExerciseType.all, ExerciseType.beater].includes(exerciseType) && (
              <Head
                style={{ color: "black", width: "100px", height: "100px" }}
              />
            )}
            {[ExerciseType.all, ExerciseType.chaser].includes(exerciseType) && (
              <Head
                style={{
                  color: "white",
                  width: "100px",
                  height: "100px",
                  ...(exerciseType === ExerciseType.all && {
                    transform: "scale(-1,1)",
                  }),
                }}
              />
            )}
          </SoftBox>
        )}
      </CardContent>
      <CardActions disableSpacing>
        <Tooltip title={t("ExerciseList:cardView.personAmount")}>
          <Chip
            avatar={<PeopleIcon />}
            label={exercise.persons}
            sx={{ mr: 1 }}
          />
        </Tooltip>
        <Tooltip title={t("ExerciseList:cardView.beaterAmount")}>
          <Chip
            avatar={
              <Avatar
                sx={{ backgroundColor: "black.main", color: "black.main" }}
              >
                <CircleIcon sx={{ color: "black.main" }} />
              </Avatar>
            }
            label={exercise.beaters}
            sx={{ mr: 1 }}
          />
        </Tooltip>
        <Tooltip title={t("ExerciseList:cardView.chaserAmount")}>
          <Chip
            avatar={
              <Avatar
                sx={{ backgroundColor: "white.main", color: "white.main" }}
              >
                <CircleIcon sx={{ color: "white.main" }} />
              </Avatar>
            }
            label={exercise.chasers}
            sx={{ mr: 1 }}
          />
        </Tooltip>
        <Tooltip title={t("ExerciseList:cardView.timeInMinutes")}>
          <Chip avatar={<TimelapseIcon />} label={exercise.time_min} />
        </Tooltip>
        <ExpandMore
          expand={moreInformationExpanded}
          onClick={() => setMoreInformationExpanded(!moreInformationExpanded)}
          aria-expanded={moreInformationExpanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      <Collapse in={moreInformationExpanded} timeout="auto" unmountOnExit>
        <CardContent>
          <List sx={{ width: "100%" }} component="nav">
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <PeopleIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={exercise.persons}
                secondary={t("ExerciseList:cardView.personsAmount")}
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <Cone />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <SoftTypography
                    sx={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {(exercise.materials?.length ?? 0) > 0
                      ? exercise.materials?.join(", ")
                      : "-"}
                  </SoftTypography>
                }
                secondary={t("ExerciseList:cardView.materials")}
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <TagIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <SoftTypography
                    sx={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {(exercise.tags?.length ?? 0) > 0
                      ? exercise.tags?.join(", ")
                      : "-"}
                  </SoftTypography>
                }
                secondary={t("ExerciseList:cardView.tags")}
              />
            </ListItem>
            <ListItem>
              <ListItemAvatar>
                <Avatar>
                  <RelationOneToMany />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <SoftTypography
                    sx={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {exercise.related_to?.length ?? 0}
                  </SoftTypography>
                }
                secondary={t("ExerciseList:cardView.relatedExercises")}
              />
            </ListItem>
          </List>
        </CardContent>
      </Collapse>
      <CardActions>
        <SoftButton
          variant="contained"
          color="primary"
          fullWidth
          onClick={onOpenExerciseClick}
        >
          {t("ExerciseList:cardView.openExercise")}
        </SoftButton>
      </CardActions>
    </Card>
  );
};

export default ExerciseCard;
