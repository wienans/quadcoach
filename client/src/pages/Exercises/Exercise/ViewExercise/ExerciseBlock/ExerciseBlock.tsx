import { useTranslation } from "react-i18next";
import { Block } from "../../../../../api/quadcoachApi/domain";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardActions,
  CardHeader,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReactPlayer from "react-player";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import TacticBoardInBlockWrapper from "./TacticBoardInBlock";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";

export type ExerciseBlockProps = {
  block: Block;
  blockNumber: number;
};

const ExerciseBlock = ({
  block,
  blockNumber,
}: ExerciseBlockProps): JSX.Element => {
  const { t } = useTranslation("Exercise");

  return (
    <Card sx={{ my: 3, display: "flex" }} key={block._id}>
      <CardHeader
        title={t("Exercise:block.title", { blockNumber })}
        subheader={t("Exercise:block.minutes", {
          minutes: block.time_min,
        })}
        sx={{
          pb: 0,
        }}
      />
      {block.video_url != "" && (
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
              url={block.video_url}
              width="100%"
              height="100%"
              controls
              light
            />
          </AccordionDetails>
        </Accordion>
      )}
      {Boolean(block.tactics_board) && (
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
            <TacticBoardInBlockWrapper block={block} />
          </AccordionDetails>
        </Accordion>
      )}
      {block.description && block.description != "" && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {t("Exercise:block.description")}
          </AccordionSummary>
          <AccordionDetails sx={{ ml: 2 }}>
            <Markdown remarkPlugins={[remarkGfm]}>{block.description}</Markdown>
          </AccordionDetails>
        </Accordion>
      )}
      {block.coaching_points && block.coaching_points != "" && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {t("Exercise:block.coachingPoints")}
          </AccordionSummary>
          <AccordionDetails sx={{ ml: 2 }}>
            <Markdown remarkPlugins={[remarkGfm]}>
              {block.coaching_points}
            </Markdown>
          </AccordionDetails>
        </Accordion>
      )}
      {block.tactics_board && block.tactics_board != "" && (
        <CardActions disableSpacing>
          <IconButton href={`/tacticboards/${block.tactics_board}`}>
            <ContentPasteIcon />
          </IconButton>
        </CardActions>
      )}
    </Card>
  );
};

export default ExerciseBlock;
