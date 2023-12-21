import { useMemo } from "react";
import {
  DataGrid,
  GridColDef,
  GridEventListener,
  GridRowParams,
} from "@mui/x-data-grid";
import { Alert, LinearProgress, styled } from "@mui/material";
import { SoftBox } from "../../../components";
import { Chip } from "@mui/material";
import { TacticBoard } from "../../../api/quadcoachApi/domain";
import { useTranslation } from "react-i18next";

const NoRowsAlert = () => {
  const { t } = useTranslation("TacticBoardList");
  return (
    <SoftBox
      display="flex"
      height="100%"
      width="100%"
      alignItems="center"
      justifyContent="center"
    >
      <Alert color="info">{t("TacticBoardList:noTacticBoardsFound")}</Alert>
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

export type TacticBoardsListViewProps = {
  tacticBoards?: TacticBoard[];
  isTacticBoardsLoading: boolean;
  onOpenTacticBoardClick: (exerciseId: string) => void;
};

const TacticBoardsListView = ({
  tacticBoards,
  isTacticBoardsLoading,
  onOpenTacticBoardClick,
}: TacticBoardsListViewProps): JSX.Element => {
  const { t } = useTranslation("TacticBoardList");

  const handleRowClick: GridEventListener<"rowClick"> = (
    params: GridRowParams<TacticBoard>,
  ) => {
    onOpenTacticBoardClick(params.row._id);
  };

  const columns2: GridColDef<TacticBoard>[] = useMemo(
    () => [
      {
        field: "name",
        headerName: t("TacticBoardList:columns.name"),
        editable: false,
        hideable: false,
        flex: 2,
      },
      {
        field: "tags",
        headerName: t("TacticBoardList:columns.tags"),
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
      slots={{
        loadingOverlay: LinearProgress,
        noRowsOverlay: NoRowsAlert,
      }}
      loading={isTacticBoardsLoading}
      getRowId={(row) => row._id}
      rows={tacticBoards?.filter((item) => !item.isPrivate) || []}
      columns={columns2}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 5,
          },
        },
      }}
      pageSizeOptions={[5]}
      disableRowSelectionOnClick
      onRowClick={handleRowClick}
      autoHeight
    />
  );
};

export default TacticBoardsListView;
