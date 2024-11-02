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
  useAddTacticBoardMutation,
  useGetTacticBoardHeadersQuery,
} from "../../api/quadcoachApi/tacticboardApi";
import { TacticPageWithOutId } from "../../api/quadcoachApi/domain/TacticPage";
import { useTranslation } from "react-i18next";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import GridViewIcon from "@mui/icons-material/GridView";
import ListIcon from "@mui/icons-material/List";
import TacticBoardListView from "./listView/TacticBoardListView";
import TacticBoardCardView from "./cardView/TacticBoardCardView";
import AddIcon from "@mui/icons-material/Add";
import { DashboardLayout } from "../../components/LayoutContainers";
import { useAuth } from "../../store/hooks";
import Footer from "../../components/Footer";
import { TacticBoardWithOutIds } from "../../api/quadcoachApi/domain/TacticBoard";

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

  const { name: userName, id: userId, status: userStatus } = useAuth();

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

  const {
    data: tacticBoards,
    isError: isTacticBoardsError,
    isLoading: isTacticBoardsLoading,
  } = useGetTacticBoardHeadersQuery({
    nameRegex: tacticBoardFilter.searchValue,
    tagString: tacticBoardFilter.tagString,
  });

  const [addTacticBoard] = useAddTacticBoardMutation();

  const onOpenTacticBoardClick = (tacticBoardId: string) => {
    navigate(`/tacticboards/${tacticBoardId}`);
  };

  const handleAddTacticBoard = (
    name: string | undefined,
    backgroundImage: string | undefined,
  ) => {
    if (name) {
      const emptyPage: TacticPageWithOutId = {
        objects: undefined,
        backgroundImage: {
          type: "image",
          src: backgroundImage ? backgroundImage : "/full-court.svg",
          width: 1220,
          height: 686,
        },
      };
      const newTacticBoard: TacticBoardWithOutIds = {
        name: name,
        isPrivate: false,
        creator: userName,
        user: userId,
        pages: [emptyPage],
      };

      addTacticBoard(newTacticBoard).then(
        (
          result:
            | { data: { message: string; _id: string } }
            | { error: unknown },
        ) => {
          if ("error" in result) return;
          if (!result.data) return;
          navigate(`/tacticboards/${result.data._id}`);
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
    <DashboardLayout
      header={(scrollTrigger) => (
        <Card
          sx={(theme) => ({
            position: "sticky",
            top: theme.spacing(1),
            zIndex: 1,
            ...(scrollTrigger
              ? {
                  backgroundColor: theme.palette.transparent.main,
                  boxShadow: theme.boxShadows.navbarBoxShadow,
                  backdropFilter: `saturate(200%) blur(${theme.functions.pxToRem(
                    30,
                  )})`,
                }
              : {
                  backgroundColor: theme.functions.rgba(
                    theme.palette.white.main,
                    0.8,
                  ),
                  boxShadow: "none",
                  backdropFilter: "none",
                }),
            transition: theme.transitions.create("all", {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.standard,
            }),
          })}
        >
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
      )}
    >
      {() => (
        <>
          <SoftBox sx={{ mt: 2, display: "flex" }}>
            {userStatus != null && (
              <SoftButton
                startIcon={isUpMd && <AddIcon />}
                color="secondary"
                onClick={() => {
                  setOpenAddTacticBoardDialog(true);
                }}
              >
                {isUpMd ? t("TacticBoardList:addTacticBoard") : <AddIcon />}
              </SoftButton>
            )}
            <AddTacticBoardDialog
              isOpen={openAddTacticBoardDialog}
              onConfirm={(name, backgroundImage) =>
                handleAddTacticBoard(name, backgroundImage)
              }
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
          <Footer />
        </>
      )}
    </DashboardLayout>
  );
};

export default TacticBoardList;
