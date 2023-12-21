import { useFabricJs } from "../FabricJsContext";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { SoftTypography, SoftButton, SoftBox } from "..";
import {
  Switch,
  FormControlLabel,
  Grid,
  Stack,
  Pagination,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export type TacticsBoardToolBarProps = {
  editMode: boolean;
  disabled?: boolean;
  setEditMode: (editMode: boolean) => void;
  setPage: (page: number) => void;
  currentPage: number;
  setMaxPages: (maxPages: number) => void;
  maxPages: number;
  onSave: () => void;
  onLoadPage: (page: number, newPage?: boolean, removePage?: boolean) => void;
};

const TacticsBoardToolBar = ({
  editMode,
  setEditMode,
  setPage,
  currentPage,
  setMaxPages,
  maxPages,
  onSave,
  disabled,
  onLoadPage,
}: TacticsBoardToolBarProps): JSX.Element => {
  const navigate = useNavigate();
  const { id: tacticBoardId } = useParams();
  const { getAllObjectsJson, removeActiveObjects, setSelection, setDrawMode } =
    useFabricJs();
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    onLoadPage(value);
  };
  const [drawingEnabled, enableDrawing] = useState<boolean>(false);
  return (
    <div>
      <Grid container>
        <Grid item xs={3}>
          <SoftButton
            disabled={disabled}
            sx={{ m: 1 }}
            onClick={() => {
              navigate(`/tacticboards/${tacticBoardId}/update`);
            }}
          >
            Back
          </SoftButton>
          <SoftButton
            disabled={disabled}
            sx={{ m: 1 }}
            onClick={() => {
              removeActiveObjects();
            }}
          >
            Remove
          </SoftButton>
        </Grid>
        <Grid item xs={3}>
          <SoftButton onClick={onSave}>Save</SoftButton>
        </Grid>
        <Grid item xs={2}>
          <FormControlLabel
            control={
              <Switch
                defaultChecked
                disabled={disabled}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setEditMode(event.target.checked);
                  setSelection(event.target.checked);
                  if (event.target.checked == false) {
                    enableDrawing(false);
                    setDrawMode(false);
                  }
                }}
              />
            }
            label="Edit Mode"
          />
          <FormControlLabel
            control={
              <Switch
                checked={drawingEnabled}
                disabled={!editMode || disabled}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setDrawMode(event.target.checked);
                  enableDrawing(event.target.checked);
                }}
              />
            }
            label="Draw Mode"
          />
        </Grid>
        <Grid item xs={4}>
          <Stack spacing={2} direction="row">
            <SoftButton
              size="small"
              disabled={disabled || maxPages == 1 || currentPage != maxPages}
              onClick={() => {
                if (maxPages > 1) {
                  setMaxPages(maxPages - 1);
                  setPage(currentPage - 1);
                  onLoadPage(currentPage - 1, false, true);
                }
              }}
            >
              -
            </SoftButton>
            <Pagination
              count={maxPages}
              siblingCount={0}
              boundaryCount={0}
              page={currentPage}
              disabled={disabled}
              onChange={handleChange}
            />
            <SoftButton
              size="small"
              disabled={disabled || currentPage != maxPages}
              onClick={() => {
                setMaxPages(maxPages + 1);
                setPage(currentPage + 1);
                onLoadPage(currentPage + 1, true, false);
              }}
            >
              +
            </SoftButton>
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
};

export default TacticsBoardToolBar;
