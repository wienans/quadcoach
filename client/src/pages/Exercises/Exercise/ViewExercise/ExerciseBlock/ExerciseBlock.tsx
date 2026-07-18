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
import { TacticBoardAutocomplete } from "../../../../../components/ExerciseParts";
import { FormikProps, FieldArray, FieldArrayRenderProps } from "formik";
import { ExercisePartialId } from "../../../../../api/quadcoachApi/domain";
import {
  SoftInput,
  SoftButton,
  SoftTypography,
} from "../../../../../components";
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
    <Card
      sx={{ my: 3, border: isEditMode ? "2px solid primary.main" : "none" }}
      key={block._id}
    >
      <CardHeader
        title={t("Exercise:block.title", { blockNumber })}
        subheader={
          isEditMode ? (
            <div>
              <SoftTypography variant="body2" color="secondary">
                {t("Exercise:info.timeInMinutes")}
              </SoftTypography>
              <SoftInput
                type="number"
                value={currentBlock.time_min}
                onChange={(e) => {
                  formik.setFieldValue(
                    `description_blocks.${blockIndex}.time_min`,
                    parseInt(e.target.value) || 0,
                  );
                }}
                placeholder={t("Exercise:info.time")}
                inputProps={{ min: 0 }}
              />
            </div>
          ) : (
            t("Exercise:block.minutes", {
              minutes: currentBlock.time_min,
            })
          )
        }
        action={
          isEditMode &&
          formik.values.description_blocks &&
          formik.values.description_blocks.length > 1 ? (
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
      {currentBlock.video_url &&
        currentBlock.video_url !== "" &&
        !isEditMode && (
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
                formik.setFieldValue(
                  `description_blocks.${blockIndex}.video_url`,
                  e.target.value,
                );
              }}
              placeholder="Youtube or Instagram URL"
              fullWidth
            />
            {currentBlock.video_url && currentBlock.video_url !== "" && (
              <div
                style={{
                  marginTop: 16,
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

      {/* Tactic Board Section */}
      {Boolean(currentBlock.tacticBoardId) && !isEditMode && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            Tactic Board
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

      {/* Tactic Board Edit Mode */}
      {isEditMode && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            Tactic Board
          </AccordionSummary>
          <AccordionDetails>
            <TacticBoardAutocomplete
              value={currentBlock.tacticBoardId}
              publicOnly
              onChange={(_event, value) => {
                formik.setFieldValue(
                  `description_blocks.${blockIndex}.tacticBoardId`,
                  value?._id || undefined,
                );
              }}
              onBlur={() => {}}
            />
            {Boolean(currentBlock.tacticBoardId) && (
              <div style={{ marginTop: 16 }}>
                <TacticBoardInBlockWrapper block={currentBlock} />
              </div>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Description Section */}
      {currentBlock.description &&
        currentBlock.description !== "" &&
        !isEditMode && (
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
                formik.setFieldValue(
                  `description_blocks.${blockIndex}.description`,
                  value || "",
                );
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}

      {/* Coaching Points Section */}
      {currentBlock.coaching_points &&
        currentBlock.coaching_points !== "" &&
        !isEditMode && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              {t("Exercise:block.coachingPoints")}
            </AccordionSummary>
            <AccordionDetails sx={{ ml: 2 }}>
              <Suspense fallback={<div>Loading...</div>}>
                <MarkdownRenderer>
                  {currentBlock.coaching_points}
                </MarkdownRenderer>
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
                formik.setFieldValue(
                  `description_blocks.${blockIndex}.coaching_points`,
                  value || "",
                );
              }}
            />
          </AccordionDetails>
        </Accordion>
      )}
    </Card>
  );
};

export default ExerciseBlock;
