import "./translations";
import { useFabricJs } from "../FabricJsContext";
import { useState } from "react";
import { Grid, Stack, Pagination, ToggleButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import DrawIcon from "@mui/icons-material/Draw";
import EditIcon from "@mui/icons-material/Edit";

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
  playerANumbers: number[];
  setPlayerANumbers: (array: number[]) => void;
  playerBNumbers: number[];
  setPlayerBNumbers: (array: number[]) => void;
};

const TacticsBoardToolBar = ({
  editMode,
  setEditMode,
  setPage,
  currentPage,
  setMaxPages,
  maxPages,
  disabled,
  onLoadPage,
  playerANumbers,
  setPlayerANumbers,
  playerBNumbers,
  setPlayerBNumbers,
}: TacticsBoardToolBarProps): JSX.Element => {
  const { removeActiveObjects, setSelection, setDrawMode, getActiveObjects } =
    useFabricJs();
  const handleChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    onLoadPage(value);
  };
  const [drawingEnabled, enableDrawing] = useState<boolean>(false);
  return (
    <div>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={1}></Grid>
        <Grid item xs={4}>
          <ToggleButton
            value="edit"
            selected={editMode}
            disabled={disabled}
            onChange={() => {
              setEditMode(!editMode);
              setSelection(!editMode);
              if (!editMode == false) {
                enableDrawing(false);
                setDrawMode(false);
              }
            }}
          >
            <EditIcon fontSize="medium" />
          </ToggleButton>
          <ToggleButton
            value="delete"
            disabled={!editMode || disabled}
            onClick={() => {
              getActiveObjects().forEach((obj) => {
                if (obj._objects) {
                  let teamA = false;
                  let number = -1;
                  obj._objects.forEach((obj) => {
                    if (obj.type == "text") {
                      number = parseInt(obj.text);
                    }
                    if (obj.type == "circle") {
                      if (obj.fill == "purple") {
                        teamA = true;
                      }
                    }
                  });
                  if (teamA) {
                    setPlayerANumbers(
                      playerANumbers.filter((item) => item !== number),
                    );
                  } else {
                    setPlayerBNumbers(
                      playerBNumbers.filter((item) => item !== number),
                    );
                  }
                }
              });
              removeActiveObjects();
            }}
          >
            <DeleteIcon fontSize="medium" />
          </ToggleButton>
          <ToggleButton
            value="drawing"
            selected={drawingEnabled}
            disabled={!editMode || disabled}
            onChange={() => {
              setDrawMode(!drawingEnabled);
              enableDrawing(!drawingEnabled);
            }}
          >
            <DrawIcon fontSize="medium" />
          </ToggleButton>
        </Grid>
        <Grid item xs={7}>
          <Stack spacing={2} direction="row">
            <ToggleButton
              value="remove-page"
              disabled={disabled || maxPages == 1 || currentPage != maxPages}
              onClick={() => {
                if (maxPages > 1) {
                  setMaxPages(maxPages - 1);
                  setPage(currentPage - 1);
                  onLoadPage(currentPage - 1, false, true);
                }
              }}
            >
              <RemoveIcon />
            </ToggleButton>
            <Pagination
              count={maxPages}
              siblingCount={0}
              boundaryCount={0}
              page={currentPage}
              disabled={disabled}
              onChange={handleChange}
            />
            <ToggleButton
              value="add-page"
              disabled={disabled || currentPage != maxPages}
              onClick={() => {
                setMaxPages(maxPages + 1);
                setPage(currentPage + 1);
                onLoadPage(currentPage + 1, true, false);
              }}
            >
              <AddIcon />
            </ToggleButton>
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
};

export default TacticsBoardToolBar;
