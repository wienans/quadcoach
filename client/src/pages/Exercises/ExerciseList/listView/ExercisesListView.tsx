import { useMemo, useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridPagination,
  GridPaginationModel,
  GridRowParams,
  GridSlotsComponentsProps,
  gridPageCountSelector,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid";
import {
  Alert,
  LinearProgress,
  TablePaginationProps,
  styled,
} from "@mui/material";
import { Chip, Box } from "@mui/material";
import MuiPagination from "@mui/material/Pagination";
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

const Pagination = ({
  page,
  onPageChange,
  className,
}: Pick<TablePaginationProps, "page" | "onPageChange" | "className">) => {
  const apiRef = useGridApiContext();
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  return <span>Hallo</span>;
  return (
    <Box>
      <span>Hallo</span>
      <MuiPagination
        color="primary"
        className={className}
        count={pageCount}
        page={page + 1}
        onChange={(event, newPage) => {
          onPageChange(event as any, newPage - 1);
        }}
      />
    </Box>
  );
};

const CustomPagination = (props: any) => {
  return <GridPagination ActionsComponent={Pagination} {...props} />;
};

const CustomFooter = (props: GridSlotsComponentsProps) => {
  return <CustomPagination />;
  return (
    <Box sx={{ display: "flex", width: "100%" }}>
      <Box sx={{ ml: "auto" }}>
        <CustomPagination />
      </Box>
    </Box>
  );
};

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
        // pagination: CustomPagination,
        // footer: CustomFooter,
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
