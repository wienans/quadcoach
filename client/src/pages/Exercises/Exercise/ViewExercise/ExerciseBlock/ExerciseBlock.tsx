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
import DeleteIcon from "@mui/icons-material/Delete";
import UniversalMediaPlayer from "../../../../../components/UniversalMediaPlayer";
import TacticBoardInBlockWrapper from "./TacticBoardInBlock";
import { lazy, Suspense } from "react";
import TacticboardAutocomplete from "../../../../../components/ExerciseEditForm/TacticboardAutocomplete/TacticboardAutocomplete";
import { FormikProps, FieldArray, FieldArrayRenderProps } from "formik";
import { ExercisePartialId } from "../../../../../api/quadcoachApi/domain";
import { SoftInput, SoftButton } from "../../../../../components";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MarkdownRenderer = lazy(
  () => import("../../../../../components/MarkdownRenderer"),
);

export type ExerciseBlockProps = {
  block: Block;
  blockNumber: number;
  isEditMode?: boolean;
  formik: FormikProps<ExercisePartialId>;
  blockIndex: number;
};

const ExerciseBlock = ({
  block,
  blockNumber,
  isEditMode = false,
  formik,
  blockIndex,
}: ExerciseBlockProps): JSX.Element => {
  const { t } = useTranslation("Exercise");

  const currentBlock = formik.values.description_blocks?.[blockIndex] || block;

  return (
    <Card sx={{ my: 3, border: isEditMode ? "2px solid primary.main" : "none" }} key={block._id}>
      <CardHeader
        title={t("Exercise:block.title", { blockNumber })}
        subheader={
          isEditMode ? (
            <SoftInput
              type="number"
              value={currentBlock.time_min}
              onChange={(e) => {
                formik.setFieldValue(`description_blocks.${blockIndex}.time_min`, parseInt(e.target.value) || 0);
              }}
              placeholder={t("Exercise:info.time")}
              inputProps={{ min: 0 }}
            />
          ) : (
            t("Exercise:block.minutes", {
              minutes: currentBlock.time_min,
            })
          )
        }
        action={
          isEditMode && formik.values.description_blocks && formik.values.description_blocks.length > 1 ? (
            <FieldArray
              name="description_blocks"
              render={(arrayHelpers: FieldArrayRenderProps) => (
                <SoftButton
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => arrayHelpers.remove(blockIndex)}
                  startIcon={<DeleteIcon />}
                >
                  Delete Block
                </SoftButton>
              )}
            />
          ) : null
        }
        sx={{
          pb: 0,
        }}
      />
      {/* Video Section */}
      {(currentBlock.video_url && currentBlock.video_url !== "" && !isEditMode) && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            Video
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0, pb: 1 }}>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "clamp(400px, 50%, 960px)",
                }}
              >
                <UniversalMediaPlayer
                  url={currentBlock.video_url || ""}
                  width="100%"
                  maintainAspectRatio
                  controls
                  light
                />
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      )}
      
      {/* Video URL Edit Mode */}
      {isEditMode && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            Video URL
          </AccordionSummary>
          <AccordionDetails>
            <SoftInput
              value={currentBlock.video_url || ""}
              onChange={(e) => {
                formik.setFieldValue(`description_blocks.${blockIndex}.video_url`, e.target.value);
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              fullWidth
            />
            {currentBlock.video_url && currentBlock.video_url !== "" && (
              <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: "clamp(400px, 50%, 960px)" }}>
                  <UniversalMediaPlayer
                    url={currentBlock.video_url}
                    width="100%"
                    maintainAspectRatio
                    controls
                    light
                  />
                </div>
              </div>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Tacticboard Section */}
      {Boolean(currentBlock.tactics_board) && !isEditMode && (
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

      {/* Tacticboard Edit Mode */}
      {isEditMode && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            Tacticboard
          </AccordionSummary>
          <AccordionDetails>
            <TacticboardAutocomplete
              value={currentBlock.tactics_board}
              onChange={(event, value) => {
                formik.setFieldValue(`description_blocks.${blockIndex}.tactics_board`, value?._id || undefined);
              }}
              onBlur={() => {}}
            />
            {Boolean(currentBlock.tactics_board) && (
              <div style={{ marginTop: 16 }}>
                <TacticBoardInBlockWrapper block={currentBlock} />
              </div>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Description Section */}
      {(currentBlock.description && currentBlock.description !== "" && !isEditMode) && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {t("Exercise:block.description")}
          </AccordionSummary>
          <AccordionDetails sx={{ ml: 2 }}>
            <Suspense fallback={<div>Loading...</div>}>
              <MarkdownRenderer>{currentBlock.description}</MarkdownRenderer>
            </Suspense>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Description Edit Mode */}
      {isEditMode && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {t("Exercise:block.description")}
          </AccordionSummary>
          <AccordionDetails>
            <MDEditor
              height={300}
              value={currentBlock.description || ""}
              onChange={(value) => {
                formik.setFieldValue(`description_blocks.${blockIndex}.description`, value || "");
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Coaching Points Section */}
      {(currentBlock.coaching_points && currentBlock.coaching_points !== "" && !isEditMode) && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {t("Exercise:block.coachingPoints")}
          </AccordionSummary>
          <AccordionDetails sx={{ ml: 2 }}>
            <Suspense fallback={<div>Loading...</div>}>
              <MarkdownRenderer>{currentBlock.coaching_points}</MarkdownRenderer>
            </Suspense>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Coaching Points Edit Mode */}
      {isEditMode && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            {t("Exercise:block.coachingPoints")}
          </AccordionSummary>
          <AccordionDetails>
            <MDEditor
              height={300}
              value={currentBlock.coaching_points || ""}
              onChange={(value) => {
                formik.setFieldValue(`description_blocks.${blockIndex}.coaching_points`, value || "");
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}
    </Card>
  );
};

export default ExerciseBlock;
