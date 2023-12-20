import "./translations";
import { ChangeEvent, MouseEvent, useEffect, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Grid,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  SoftTypography,
  SoftInput,
  SoftBox,
  SoftButton,
  AddTacticBoardDialog,
} from "../../components";
import {
  useLazyGetTacticBoardsQuery,
  useAddTacticBoardMutation,
} from "../tacticboardApi";
import {
  TacticBoardWithOutId,
  TacticBoard,
} from "../../api/quadcoachApi/domain";
import TacticPage from "../../api/quadcoachApi/domain/TacticPage";
import { useTranslation } from "react-i18next";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import GridViewIcon from "@mui/icons-material/GridView";
import ListIcon from "@mui/icons-material/List";
import TacticBoardListView from "./listView/TacticBoardListView";
import TacticBoardCardView from "./cardView/TacticBoardCardView";
import AddIcon from "@mui/icons-material/Add";

enum ViewType {
  List = "List",
  Cards = "Cards",
}

type TacticBoardFilter = {
  searchValue: string;
  tagString: string;
};

const defaultTacticBoardFilter: TacticBoardFilter = {
  searchValue: "",
  tagString: "",
};

const TacticBoardList = () => {
  const { t } = useTranslation("TacticBoardList");
  const navigate = useNavigate();
  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [viewType, setViewType] = useState<ViewType>(ViewType.Cards);
  const [openAddTacticBoardDialog, setOpenAddTacticBoardDialog] =
    useState<boolean>(false);

  useEffect(() => {
    if (isUpMd) return;
    setViewType(ViewType.Cards);
  }, [isUpMd]);

  const [tacticBoardFilter, setTacticBoardFilter] = useState<TacticBoardFilter>(
    defaultTacticBoardFilter,
  );

  const onTacticBoardFilterValueChange =
    (tacticBoardFilterProperty: keyof TacticBoardFilter) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setTacticBoardFilter({
        ...tacticBoardFilter,
        [tacticBoardFilterProperty]: event.target.value,
      });
    };

  const [
    getTacticBoards,
    {
      data: tacticBoards,
      isError: isTacticBoardsError,
      isLoading: isTacticBoardsLoading,
    },
  ] = useLazyGetTacticBoardsQuery();

  const [
    addTacticBoard,
    {
      isLoading: isAddTacticBoardLoading,
      isError: isAddTacticBoardError,
      isSuccess: isAddTacticBoardSuccess,
    },
  ] = useAddTacticBoardMutation();

  useEffect(() => {
    getTacticBoards({
      nameRegex: defaultTacticBoardFilter.searchValue,
      tagString: defaultTacticBoardFilter.tagString,
    });
  }, [getTacticBoards]);

  useEffect(() => {
    getTacticBoards({
      nameRegex: tacticBoardFilter.searchValue,
      tagString: tacticBoardFilter.tagString,
    });
  }, [tacticBoardFilter.searchValue, getTacticBoards, tacticBoardFilter]);

  const onOpenTacticBoardClick = (tacticBoardId: string) => {
    navigate(`/tacticboards/${tacticBoardId}/update`);
  };

  const handleAddTacticBoard = (name: string | undefined) => {
    if (name) {
      console.log(name);
      const emptyPage: TacticPage = {
        objects: undefined,
        backgroundImage: {
          type: "image",
          src: "/full-court_inkscape.svg",
          width: 1220,
          height: 686,
        },
      };
      const newTacticBoard: TacticBoardWithOutId = {
        name: name,
        isPrivate: false,
        pages: [emptyPage],
      };

      addTacticBoard(newTacticBoard).then(
        (result: { data: TacticBoard } | { error: unknown }) => {
          if (!result.data) return;
          console.log(result.data._id);
          navigate(`/tacticboards/${result.data._id}/update`);
        },
      );
    }
    setOpenAddTacticBoardDialog(false);
  };

  const onViewTypeChange = (
    _event: MouseEvent<HTMLElement>,
    newViewType: ViewType,
  ) => {
    setViewType(newViewType);
  };

  return (
    <SoftBox sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Card>
        <CardHeader
          title={
            <SoftTypography variant="h3">
              {t("TacticBoardList:title")}
            </SoftTypography>
          }
          action={
            <SoftBox display="flex" flexDirection="row" alignItems="center">
              {isUpMd && (
                <SoftInput
                  id="outlined-basic"
                  placeholder={t("TacticBoardList:filter.name")}
                  value={tacticBoardFilter.searchValue}
                  onChange={onTacticBoardFilterValueChange("searchValue")}
                  sx={(theme) => ({
                    minWidth: "200px",
                    mr: 1,
                    [theme.breakpoints.up("lg")]: {
                      minWidth: "300px",
                    },
                  })}
                />
              )}
              <ToggleButton
                value={showFilters ? "shown" : "hide"}
                selected={showFilters}
                onChange={() => {
                  setShowFilters(!showFilters);
                }}
              >
                <FilterAltIcon />
              </ToggleButton>
            </SoftBox>
          }
        />
        {!isUpMd && (
          <SoftBox display="flex" alignItems="center" sx={{ pb: 2, px: 2 }}>
            <SoftInput
              id="outlined-basic"
              placeholder={t("TacticBoardList:filter.name")}
              value={tacticBoardFilter.searchValue}
              onChange={onTacticBoardFilterValueChange("searchValue")}
            />
          </SoftBox>
        )}
        <Collapse in={showFilters} timeout="auto" unmountOnExit>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2} sx={{ pl: 2, width: "100%" }}>
              <Grid
                item
                xs={12}
                md={6}
                sx={{ display: "flex", flexDirection: "column" }}
              >
                <SoftTypography variant="body2">
                  {t("TacticBoardList:filter.tags.title")}
                </SoftTypography>
                <SoftInput
                  id="outlined-basic"
                  placeholder={t("TacticBoardList:filter.tags.placeholder")}
                  value={tacticBoardFilter.tagString}
                  onChange={onTacticBoardFilterValueChange("tagString")}
                  sx={{ width: "100%" }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Collapse>
      </Card>
      <SoftBox sx={{ mt: 2, display: "flex" }}>
        <SoftButton
          startIcon={isUpMd && <AddIcon />}
          color="secondary"
          onClick={() => {
            setOpenAddTacticBoardDialog(true);
          }}
        >
          {isUpMd ? t("TacticBoardList:addTacticBoard") : <AddIcon />}
        </SoftButton>
        <AddTacticBoardDialog
          isOpen={openAddTacticBoardDialog}
          onConfirm={(name) => handleAddTacticBoard(name)}
        />
        <ToggleButtonGroup
          value={viewType}
          exclusive
          onChange={onViewTypeChange}
          aria-label="text alignment"
          sx={{ marginLeft: "auto" }}
        >
          <ToggleButton value={ViewType.Cards} aria-label="Kartenansicht">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value={ViewType.List} aria-label="Listenansicht">
            <ListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </SoftBox>
      {isTacticBoardsError && (
        <Alert color="error" sx={{ mt: 2 }}>
          {" "}
          {t("TacticBoardList:errorLoadingTacticBoards")}
        </Alert>
      )}
      {!isTacticBoardsError && viewType === ViewType.List && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <TacticBoardListView
              isTacticBoardsLoading={isTacticBoardsLoading}
              onOpenTacticBoardClick={onOpenTacticBoardClick}
              tacticBoards={tacticBoards}
            />
          </CardContent>
        </Card>
      )}
      {!isTacticBoardsError && viewType === ViewType.Cards && (
        <SoftBox sx={{ mt: 2, flexGrow: 1, overflowY: "auto", p: 2 }}>
          <TacticBoardCardView
            isTacticBoardsLoading={isTacticBoardsLoading}
            onOpenTacticBoardClick={onOpenTacticBoardClick}
            tacticBoards={tacticBoards}
          />
        </SoftBox>
      )}
    </SoftBox>
  );
};

export default TacticBoardList;
