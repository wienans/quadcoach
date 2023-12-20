import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  CardHeader,
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
import { TacticBoard } from "../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import { SoftButton, SoftTypography } from "../../../components";
import TagIcon from "@mui/icons-material/Tag";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import { RelationOneToMany } from "mdi-material-ui";

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

export type TacticBoardCardProps = {
  tacticBoard: TacticBoard;
  onOpenTacticBoardClick: () => void;
};

const TacticBoardCard = ({
  tacticBoard,
  onOpenTacticBoardClick,
}: TacticBoardCardProps): JSX.Element => {
  const { t } = useTranslation("TacticBoardList");
  const [moreInformationExpanded, setMoreInformationExpanded] =
    useState<boolean>(false);

  return (
    <Card>
      <CardHeader
        avatar={<DeveloperBoardIcon />}
        title={tacticBoard.name}
        action={
          <Tooltip title={t("TacticBoardList:cardView.openExercise")}>
            <IconButton onClick={onOpenTacticBoardClick}>
              <OpenInBrowserIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent sx={{ height: "194px", position: "relative" }}></CardContent>
      <CardActions disableSpacing>
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
                    {(tacticBoard.tags?.length ?? 0) > 0
                      ? tacticBoard.tags?.join(", ")
                      : "-"}
                  </SoftTypography>
                }
                secondary={t("TacticBoardList:cardView.tags")}
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
          onClick={onOpenTacticBoardClick}
        >
          {t("TacticBoardList:cardView.openTacticBoard")}
        </SoftButton>
      </CardActions>
    </Card>
  );
};

export default TacticBoardCard;
