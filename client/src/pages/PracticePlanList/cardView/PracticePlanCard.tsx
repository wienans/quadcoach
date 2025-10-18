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
import { PracticePlanHeader } from "../../../api/quadcoachApi/domain/PracticePlan";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";
import { SoftButton, SoftBox, SoftTypography } from "../../../components";
import TagIcon from "@mui/icons-material/Tag";
import DescriptionIcon from "@mui/icons-material/Description";
import ScheduleIcon from "@mui/icons-material/Schedule";

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

export type PracticePlanCardProps = {
  practicePlan: PracticePlanHeader;
  onOpenPracticePlanClick: () => void;
};

const PracticePlanCard = ({
  practicePlan,
  onOpenPracticePlanClick,
}: PracticePlanCardProps): JSX.Element => {
  const { t } = useTranslation("PracticePlanList");
  const [moreInformationExpanded, setMoreInformationExpanded] =
    useState<boolean>(false);

  const calculateTotalDuration = () => {
    if (!practicePlan.sections) return 0;
    return practicePlan.sections.reduce((total, section) => {
      return total + (section.targetDuration || 0);
    }, 0);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <Card>
      <CardHeader
        avatar={<DescriptionIcon />}
        title={practicePlan.name}
        subheader={
          practicePlan.sections && practicePlan.sections.length > 0
            ? `${practicePlan.sections.length} ${t(
                "PracticePlanList:cardView.sections",
              )}`
            : t("PracticePlanList:cardView.noSections")
        }
        action={
          <Tooltip title={t("PracticePlanList:cardView.openPracticePlan")}>
            <IconButton onClick={onOpenPracticePlanClick}>
              <OpenInBrowserIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent sx={{ position: "relative" }}>
        <SoftBox sx={{ mt: "auto" }}>
          <SoftTypography variant="caption" color="text">
            <ScheduleIcon sx={{ fontSize: 14, mr: 0.5 }} />
            {formatDuration(calculateTotalDuration())}
          </SoftTypography>
        </SoftBox>
      </CardContent>
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
                    {(practicePlan.tags?.length ?? 0) > 0
                      ? practicePlan.tags?.join(", ")
                      : "-"}
                  </SoftTypography>
                }
                secondary={t("PracticePlanList:cardView.tags")}
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
          onClick={onOpenPracticePlanClick}
        >
          {t("PracticePlanList:cardView.openPracticePlan")}
        </SoftButton>
      </CardActions>
    </Card>
  );
};

export default PracticePlanCard;
