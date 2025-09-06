import { useTranslation } from "react-i18next";
import { Block } from "../../../../../api/quadcoachApi/domain";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardHeader,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UniversalMediaPlayer from "../../../../../components/UniversalMediaPlayer";
import TacticBoardInBlockWrapper from "./TacticBoardInBlock";
import { lazy, Suspense } from "react";

const MarkdownRenderer = lazy(
  () => import("../../../../../components/MarkdownRenderer"),
);

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
            <UniversalMediaPlayer
              style={{ position: "absolute", left: 0, top: 0 }}
              url={block.video_url || ""}
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
            Tacticboard
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
            <Suspense fallback={<div>Loading...</div>}>
              <MarkdownRenderer>{block.description}</MarkdownRenderer>
            </Suspense>
          </AccordionDetails>
        </Accordion>
      )}
      {block.coaching_points && block.coaching_points != "" && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {t("Exercise:block.coachingPoints")}
          </AccordionSummary>
          <AccordionDetails sx={{ ml: 2 }}>
            <Suspense fallback={<div>Loading...</div>}>
              <MarkdownRenderer>{block.coaching_points}</MarkdownRenderer>
            </Suspense>
          </AccordionDetails>
        </Accordion>
      )}
    </Card>
  );
};

export default ExerciseBlock;
