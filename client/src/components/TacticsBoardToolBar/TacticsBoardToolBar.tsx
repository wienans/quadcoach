import { useFabricJs } from "../FabricJsContext";
import { SoftTypography, SoftButton, SoftBox } from "..";
import {
  Switch,
  FormControlLabel,
  Grid,
  Stack,
  Pagination,
} from "@mui/material";

export type TacticsBoardToolBarProps = {
  setEditMode: (editMode: boolean) => void;
  setPage: (page: number) => void;
  currentPage: number;
  setMaxPages: (maxPages: number) => void;
  maxPages: number;
};

const TacticsBoardToolBar = ({
  setEditMode,
  setPage,
  page,
  setMaxPages,
  maxPages,
}: TacticsBoardToolBarProps): JSX.Element => {
  const { getAllObjectsJson, removeActiveObjects, setSelection } =
    useFabricJs();
  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  return (
    <div>
      <Grid container>
        <Grid item xs={3}>
          <SoftButton
            onClick={() => {
              removeActiveObjects();
            }}
          >
            Remove
          </SoftButton>
        </Grid>
        <Grid item xs={3}>
          <SoftButton
            onClick={() => {
              console.log(getAllObjectsJson());
            }}
          >
            Save
          </SoftButton>
        </Grid>
        <Grid item xs={2}>
          <FormControlLabel
            control={
              <Switch
                defaultChecked
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setEditMode(event.target.checked);
                  setSelection(event.target.checked);
                }}
              />
            }
            label="Edit Mode"
          />
        </Grid>
        <Grid item xs={4}>
          <Stack spacing={2} direction="row">
            <SoftButton
              size="small"
              onClick={() => {
                if (maxPages > 1) {
                  setMaxPages(maxPages - 1);
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
              onChange={handleChange}
            />
            <SoftButton
              size="small"
              onClick={() => {
                setMaxPages(maxPages + 1);
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
