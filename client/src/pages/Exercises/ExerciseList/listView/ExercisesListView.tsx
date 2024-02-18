import { useMemo, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridPaginationModel,
  GridRowParams,
} from "@mui/x-data-grid";
import {
  Alert,
  LinearProgress,
  styled,
} from "@mui/material";
import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { SoftBox } from "../../../../components";
import { Exercise } from "../../../../api/quadcoachApi/domain";

const NoRowsAlert = () => {
  const { t } = useTranslation("ExerciseList");
  return (
    <SoftBox
      display="flex"
      height="100%"
      width="100%"
      alignItems="center"
      justifyContent="center"
    >
      <Alert color="info">{t("ExerciseList:noExercisesFound")}</Alert>
    </SoftBox>
  );
};

const StyledDataGrid = styled(DataGrid)({
  "& .MuiDataGrid-cell:focus": {
    outline: "none",
  },
  "& .MuiDataGrid-row": {
    cursor: "pointer",
  },
}) as typeof DataGrid;

export type ExercisesListViewProps = {
  exercises?: Exercise[];
  isExercisesLoading: boolean;
  onOpenExerciseClick: (exerciseId: string) => void;
};

const ExercisesListView = ({
  exercises,
  isExercisesLoading,
  onOpenExerciseClick,
}: ExercisesListViewProps): JSX.Element => {
  const { t } = useTranslation("ExerciseList");

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const handleRowClick: GridEventListener<"rowClick"> = (
    params: GridRowParams<Exercise>,
  ) => {
    onOpenExerciseClick(params.row._id);
  };

  const columns2: GridColDef<Exercise>[] = useMemo(
    () => [
      {
        field: "name",
        headerName: t("ExerciseList:columns.name"),
        editable: false,
        hideable: false,
        flex: 2,
      },
      {
        field: "persons",
        headerName: t("ExerciseList:columns.persons"),
        type: "number",
        editable: false,
        flex: 1,
      },
      {
        field: "tags",
        headerName: t("ExerciseList:columns.tags"),
        editable: false,
        flex: 3,
        renderCell: (params) => {
          if (params.value.length > 0 && params.value[0] != "") {
            return params.value.map((el: string) => (
              <Chip
                key={el}
                label={el}
                sx={{ margin: "1px" }}
                variant={"outlined"}
              />
            ));
          }
        },
      },
    ],
    [t],
  );

  return (
    <StyledDataGrid
      pagination
      slots={{
        loadingOverlay: LinearProgress,
        noRowsOverlay: NoRowsAlert,
      }}
      loading={isExercisesLoading}
      getRowId={(row) => row._id}
      rows={exercises || []}
      columns={columns2}
      initialState={{
        pagination: {
          paginationModel,
        },
      }}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      pageSizeOptions={[5, 10, 25]}
      disableRowSelectionOnClick
      onRowClick={handleRowClick}
      autoHeight
    />
  );
};

export default ExercisesListView;
