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
  CardHeader,
  Checkbox,
  FormControlLabel,
  Theme,
  ToggleButton,
  useMediaQuery,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Popover,
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
  GetTacticBoardRequest,
  useAddTacticBoardMutation,
  useLazyGetTacticBoardsQuery,
} from "../../api/quadcoachApi/tacticBoardApi";
import { TacticPageWithOutId } from "../../api/quadcoachApi/domain/TacticPage";
import { useTranslation } from "react-i18next";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import TacticBoardCardView from "./cardView/TacticBoardCardView";
import AddIcon from "@mui/icons-material/Add";
import { DashboardLayout } from "../../components/LayoutContainers";
import { useAuth } from "../../store/hooks";
import Footer from "../../components/Footer";
import {
  TacticBoardSummary,
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

type TacticBoardListRequest = GetTacticBoardRequest & {
  search: string;
  tags: string[];
  tagMode: "all";
  sort: "name" | "created" | "updated";
  direction: "asc" | "desc";
  page: number;
  limit: number;
};

const defaultTacticBoardRequest: TacticBoardListRequest = {
  search: "",
  tags: [],
  tagMode: "all",
  privacy: undefined,
  sort: "name",
  direction: "asc",
  page: 1,
  limit: 50,
};

const TacticBoardList = () => {
  const { t } = useTranslation("TacticBoardList");
  const navigate = useNavigate();
  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  const { name: userName, id: userId, status: userStatus } = useAuth();

  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const [viewType, setViewType] = useState<ViewType>(ViewType.Cards);
  const [openAddTacticBoardDialog, setOpenAddTacticBoardDialog] =
    useState<boolean>(false);

  useEffect(() => {
    if (isUpMd) return;
    setViewType(ViewType.Cards);
  }, [isUpMd]);

  const [loadedTacticBoards, setLoadedTacticBoards] = useState<
    TacticBoardSummary[]
  >([]);

  const [tacticBoardRequest, setTacticBoardRequest] =
    useState<TacticBoardListRequest>(defaultTacticBoardRequest);
  const [tagInput, setTagInput] = useState("");

  const updateTacticBoardQueryAndResetResults = (
    update: (
      current: TacticBoardListRequest,
    ) => Partial<TacticBoardListRequest>,
  ) => {
    setLoadedTacticBoards([]);
    setTacticBoardRequest((current) => ({
      ...current,
      ...update(current),
      page: 1,
    }));
  };

  const [
    getTacticBoards,
    {
      data: tacticBoardsData,
      isError: isTacticBoardsError,
      isLoading: isTacticBoardsLoading,
    },
  ] = useLazyGetTacticBoardsQuery();

  // Create debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((request: TacticBoardListRequest) => {
      getTacticBoards(request);
    }, 300),
    [getTacticBoards],
  );

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const search = event.target.value;
    updateTacticBoardQueryAndResetResults(() => ({ search }));
  };

  // Cleanup
  useEffect(() => {
    debouncedSearch(tacticBoardRequest);
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch, tacticBoardRequest]);

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
    if (event.key === "Enter" && tagInput.trim() !== "") {
      event.preventDefault();
      const tag = tagInput.trim();
      if (
        tacticBoardRequest.tags.some(
          (selected) => selected.toLowerCase() === tag.toLowerCase(),
        )
      ) {
        setTagInput("");
        return;
      }
      updateTacticBoardQueryAndResetResults((current) => ({
        tags: [...current.tags, tag],
      }));
      setTagInput("");
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    updateTacticBoardQueryAndResetResults((current) => ({
      tags: current.tags.filter((tag) => tag !== tagToDelete),
    }));
  };

  // Load more function
  const loadMore = useCallback(() => {
    if (
      tacticBoardsData &&
      tacticBoardRequest.page < tacticBoardsData.pagination.pages
    ) {
      setTacticBoardRequest((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [tacticBoardsData, tacticBoardRequest.page]);

  // Update effect to accumulate loaded Tactic Boards.
  useEffect(() => {
    if (tacticBoardsData?.items) {
      setLoadedTacticBoards((prev) => {
        if (tacticBoardsData.pagination.page === 1) {
          return tacticBoardsData.items;
        }
        const newTacticBoardIds = new Set(
          tacticBoardsData.items.map((t) => t._id),
        );
        const filteredPrev = prev.filter((t) => !newTacticBoardIds.has(t._id));
        return [...filteredPrev, ...tacticBoardsData.items];
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
                    value={tacticBoardRequest.search}
                    onChange={onSearchChange}
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
                    value={tacticBoardRequest.sort}
                    label={t("TacticBoardList:filter.sort.name")}
                    onChange={(event) => {
                      updateTacticBoardQueryAndResetResults(() => ({
                        sort: event.target.value as
                          | "name"
                          | "created"
                          | "updated",
                      }));
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
                  value={tacticBoardRequest.direction}
                  selected={tacticBoardRequest.direction === "desc"}
                  onChange={() => {
                    updateTacticBoardQueryAndResetResults((current) => ({
                      direction:
                        current.direction === "asc" ? "desc" : "asc",
                    }));
                  }}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  <SortIcon />
                </ToggleButton>
                <ToggleButton
                  value={filterAnchorEl ? "shown" : "hide"}
                  selected={Boolean(filterAnchorEl)}
                  onClick={(e) => {
                    setFilterAnchorEl(filterAnchorEl ? null : e.currentTarget);
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
                value={tacticBoardRequest.search}
                onChange={onSearchChange}
              />
            </SoftBox>
          )}
          <Popover
            open={Boolean(filterAnchorEl)}
            anchorEl={filterAnchorEl}
            onClose={() => setFilterAnchorEl(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            slotProps={{
              paper: {
                sx: {
                  backgroundColor: "background.paper",
                  boxShadow: 3,
                },
              },
            }}
          >
            <SoftBox sx={{ p: 2, minWidth: 280 }}>
              <SoftTypography variant="body2" sx={{ mb: 1 }}>
                {t("TacticBoardList:filter.tags.title")}
              </SoftTypography>
              <SoftInput
                id="outlined-basic"
                placeholder={t("TacticBoardList:filter.tags.placeholder")}
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={handleTagKeyDown}
                sx={{ width: "100%" }}
                endAdornment={
                  <InputAdornment position="end">
                    <KeyboardReturnIcon
                      sx={{
                        fontSize: 20,
                        opacity: tagInput !== "" ? 1 : 0.4,
                      }}
                    />
                  </InputAdornment>
                }
              />
              <SoftBox
                sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
              >
                {tacticBoardRequest.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </SoftBox>
              <SoftBox sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={tacticBoardRequest.privacy === "private"}
                      onChange={() => {
                        updateTacticBoardQueryAndResetResults((current) => ({
                          privacy:
                            current.privacy === "private"
                              ? undefined
                              : "private",
                        }));
                      }}
                    />
                  }
                  label={t("TacticBoardList:filter.isPrivate")}
                />
              </SoftBox>
            </SoftBox>
          </Popover>
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
          {isTacticBoardsError && (
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
                tacticBoardRequest.page < tacticBoardsData.pagination.pages && (
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
