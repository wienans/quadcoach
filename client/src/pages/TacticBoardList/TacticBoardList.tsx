import "./translations";
import {
  ChangeEvent,
  useEffect,
  useState,
  useCallback,
  KeyboardEvent,
} from "react";
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Grid,
  Theme,
  ToggleButton,
  useMediaQuery,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  useLazyGetTacticBoardHeadersQuery,
} from "../../api/quadcoachApi/tacticboardApi";
import { TacticPageWithOutId } from "../../api/quadcoachApi/domain/TacticPage";
import { useTranslation } from "react-i18next";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import TacticBoardCardView from "./cardView/TacticBoardCardView";
import AddIcon from "@mui/icons-material/Add";
import { DashboardLayout } from "../../components/LayoutContainers";
import { useAuth } from "../../store/hooks";
import Footer from "../../components/Footer";
import {
  TacticBoardHeader,
  TacticBoardWithOutIds,
} from "../../api/quadcoachApi/domain/TacticBoard";
import debounce from "lodash/debounce";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { Chip } from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";

enum ViewType {
  List = "List",
  Cards = "Cards",
}

type TacticBoardFilter = {
  searchValue: string;
  tagRegex: string;
  tagList: string[];
  sortBy: "name" | "created" | "updated";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
};

const defaultTacticBoardFilter: TacticBoardFilter = {
  searchValue: "",
  tagRegex: "",
  tagList: [],
  sortBy: "name",
  sortOrder: "asc",
  page: 1,
  limit: 50,
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

  const [loadedTacticBoards, setLoadedTacticBoards] = useState<
    TacticBoardHeader[]
  >([]);

  const [tacticBoardFilter, setTacticBoardFilter] = useState<TacticBoardFilter>(
    defaultTacticBoardFilter,
  );

  const [
    getTacticBoards,
    {
      data: tacticBoardsData,
      isError: isTacticBoardsError,
      isLoading: isTacticBoardsLoading,
    },
  ] = useLazyGetTacticBoardHeadersQuery();

  // Create debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((filter: TacticBoardFilter) => {
      getTacticBoards({
        nameRegex: filter.searchValue,
        tagRegex: filter.tagRegex,
        tagList: filter.tagList,
        sortBy: filter.sortBy,
        sortOrder: filter.sortOrder,
        page: filter.page,
        limit: filter.limit,
      });
    }, 300),
    [getTacticBoards],
  );

  // Update the filter change handler
  const onTacticBoardFilterValueChange =
    (tacticBoardFilterProperty: keyof TacticBoardFilter) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setLoadedTacticBoards([]);
      setTacticBoardFilter({
        ...tacticBoardFilter,
        [tacticBoardFilterProperty]: event.target.value,
        page: 1,
      });
    };

  // Cleanup
  useEffect(() => {
    debouncedSearch(tacticBoardFilter);
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch, tacticBoardFilter]);

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

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && tacticBoardFilter.tagRegex.trim() !== "") {
      event.preventDefault();
      setLoadedTacticBoards([]);
      setTacticBoardFilter({
        ...tacticBoardFilter,
        tagList: [
          ...tacticBoardFilter.tagList,
          tacticBoardFilter.tagRegex.trim(),
        ],
        tagRegex: "",
        page: 1,
      });
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setLoadedTacticBoards([]);
    setTacticBoardFilter({
      ...tacticBoardFilter,
      tagList: tacticBoardFilter.tagList.filter((tag) => tag !== tagToDelete),
      page: 1,
    });
  };

  // Load more function
  const loadMore = useCallback(() => {
    if (
      tacticBoardsData &&
      tacticBoardFilter.page < tacticBoardsData.pagination.pages
    ) {
      setTacticBoardFilter((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [tacticBoardsData, tacticBoardFilter.page]);

  // Update effect to accumulate loaded tacticboards
  useEffect(() => {
    if (tacticBoardsData?.tacticboards) {
      setLoadedTacticBoards((prev) => {
        const newTacticBoardIds = new Set(
          tacticBoardsData.tacticboards.map((t) => t._id),
        );
        const filteredPrev = prev.filter((t) => !newTacticBoardIds.has(t._id));
        return [...filteredPrev, ...tacticBoardsData.tacticboards];
      });
    }
  }, [tacticBoardsData]);

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
                <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                  <InputLabel id="sort-select-label">
                    {t("TacticBoardList:filter.sort.name")}
                  </InputLabel>
                  <Select
                    labelId="sort-select-label"
                    value={tacticBoardFilter.sortBy}
                    label={t("TacticBoardList:filter.sort.name")}
                    onChange={(event) => {
                      setLoadedTacticBoards([]);
                      setTacticBoardFilter({
                        ...tacticBoardFilter,
                        sortBy: event.target.value as
                          | "name"
                          | "created"
                          | "updated",
                        page: 1,
                      });
                    }}
                  >
                    <MenuItem value="name">
                      {t("TacticBoardList:filter.sort.by_name")}
                    </MenuItem>
                    <MenuItem value="created">
                      {t("TacticBoardList:filter.sort.by_createdAt")}
                    </MenuItem>
                    <MenuItem value="updated">
                      {t("TacticBoardList:filter.sort.by_updatedAt")}
                    </MenuItem>
                  </Select>
                </FormControl>
                <ToggleButton
                  value={tacticBoardFilter.sortOrder}
                  selected={tacticBoardFilter.sortOrder === "desc"}
                  onChange={() => {
                    setLoadedTacticBoards([]);
                    setTacticBoardFilter({
                      ...tacticBoardFilter,
                      sortOrder:
                        tacticBoardFilter.sortOrder === "asc" ? "desc" : "asc",
                      page: 1,
                    });
                  }}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  <SortIcon />
                </ToggleButton>
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
                    value={tacticBoardFilter.tagRegex}
                    onChange={onTacticBoardFilterValueChange("tagRegex")}
                    onKeyDown={handleTagKeyDown}
                    sx={{ width: "100%" }}
                    endAdornment={
                      <InputAdornment position="end">
                        <KeyboardReturnIcon
                          sx={{
                            fontSize: 20,
                            opacity: tacticBoardFilter.tagRegex != "" ? 1 : 0.4,
                          }}
                        />
                      </InputAdornment>
                    }
                  />
                  <SoftBox
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                  >
                    {tacticBoardFilter.tagList.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => handleDeleteTag(tag)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </SoftBox>
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
          </SoftBox>
          {(!userId || userId === "") ? (
            <Alert color="error" sx={{ mt: 2 }}>
              {t("pleaseLogin")}
            </Alert>
          ) : isTacticBoardsError && (
            <Alert color="error" sx={{ mt: 2 }}>
              {t("TacticBoardList:errorLoadingTacticBoards")}
            </Alert>
          )}
          {!isTacticBoardsError && viewType === ViewType.Cards && (
            <>
              <SoftBox sx={{ mt: 2, flexGrow: 1, overflowY: "auto", p: 2 }}>
                <TacticBoardCardView
                  isTacticBoardsLoading={isTacticBoardsLoading}
                  onOpenTacticBoardClick={onOpenTacticBoardClick}
                  tacticBoards={loadedTacticBoards}
                />
              </SoftBox>
              {tacticBoardsData &&
                tacticBoardFilter.page < tacticBoardsData.pagination.pages && (
                  <SoftBox
                    display="flex"
                    justifyContent="center"
                    sx={{ mt: 2, mb: 2 }}
                  >
                    <SoftButton
                      onClick={loadMore}
                      disabled={isTacticBoardsLoading}
                    >
                      {t("TacticBoardList:loadMore")}
                    </SoftButton>
                  </SoftBox>
                )}
            </>
          )}
          <Footer />
        </>
      )}
    </DashboardLayout>
  );
};

export default TacticBoardList;
