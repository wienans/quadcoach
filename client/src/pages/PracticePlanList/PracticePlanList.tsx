import "./translations";
import {
  ChangeEvent,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  Alert,
  Autocomplete,
  Card,
  CardHeader,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Theme,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
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
  AddPracticePlanDialog,
} from "../../components";
import {
  GetPracticePlanRequest,
  useCreatePracticePlanMutation,
  useLazyGetAllPracticePlanTagsQuery,
  useLazyGetPracticePlansQuery,
} from "../../api/quadcoachApi/practicePlansApi";
import { useTranslation } from "react-i18next";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import PracticePlanCardView from "./cardView/PracticePlanCardView";
import AddIcon from "@mui/icons-material/Add";
import { DashboardLayout } from "../../components/LayoutContainers";
import { useAuth } from "../../store/hooks";
import Footer from "../../components/Footer";
import {
  PracticePlanSummary,
  PracticePlanEntity,
  PracticePlanEntityPartialId,
} from "../../api/quadcoachApi/domain/PracticePlan";
import debounce from "lodash/debounce";
import SortIcon from "@mui/icons-material/Sort";

enum ViewType {
  List = "List",
  Cards = "Cards",
}

type PracticePlanListRequest = GetPracticePlanRequest & {
  search: string;
  tags: string[];
  tagMode: "all" | "any";
  sort: "name" | "created" | "updated";
  direction: "asc" | "desc";
  page: number;
  limit: number;
};

const defaultPracticePlanRequest: PracticePlanListRequest = {
  search: "",
  tags: [],
  tagMode: "all",
  privacy: undefined,
  sort: "name",
  direction: "asc",
  page: 1,
  limit: 50,
};

const PracticePlanList = () => {
  const { t } = useTranslation("PracticePlanList");
  const navigate = useNavigate();
  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  const { id: userId, status: userStatus } = useAuth();

  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const [viewType, setViewType] = useState<ViewType>(ViewType.Cards);
  const [openAddPracticePlanDialog, setOpenAddPracticePlanDialog] =
    useState<boolean>(false);

  useEffect(() => {
    if (isUpMd) return;
    setViewType(ViewType.Cards);
  }, [isUpMd]);

  const [loadedPracticePlans, setLoadedPracticePlans] = useState<
    PracticePlanSummary[]
  >([]);

  const [practicePlanRequest, setPracticePlanRequest] =
    useState<PracticePlanListRequest>(defaultPracticePlanRequest);

  const updatePracticePlanQueryAndResetResults = (
    update: (
      current: PracticePlanListRequest,
    ) => Partial<PracticePlanListRequest>,
  ) => {
    setLoadedPracticePlans([]);
    setPracticePlanRequest((current) => ({
      ...current,
      ...update(current),
      page: 1,
    }));
  };

  const [
    getPracticePlans,
    {
      data: practicePlansData,
      isError: isPracticePlansError,
      isLoading: isPracticePlansLoading,
    },
  ] = useLazyGetPracticePlansQuery();

  const [
    getAllPracticePlanTags,
    { data: allPracticePlanTagsData, isLoading: isAllPracticePlanTagsLoading },
  ] = useLazyGetAllPracticePlanTagsQuery();

  // Create debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((request: PracticePlanListRequest) => {
      getPracticePlans(request);
    }, 300),
    [getPracticePlans],
  );

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const search = event.target.value;
    updatePracticePlanQueryAndResetResults(() => ({ search }));
  };

  // Cleanup
  useEffect(() => {
    debouncedSearch(practicePlanRequest);
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch, practicePlanRequest]);

  const [addPracticePlan] = useCreatePracticePlanMutation();

  const onOpenPracticePlanClick = (practicePlanId: string) => {
    navigate(`/practice-plans/${practicePlanId}`);
  };

  const handleAddPracticePlan = (name: string | undefined) => {
    if (name) {
      const newPracticePlan: PracticePlanEntityPartialId = {
        name: name,
        description: "",
        tags: [],
        isPrivate: false,
        sections: [
          { name: "Warm Up", targetDuration: 15, groups: [] },
          { name: "Main", targetDuration: 90, groups: [] },
          { name: "Cooldown", targetDuration: 15, groups: [] },
        ],
        user: userId,
      };

      addPracticePlan(newPracticePlan).then(
        (result: { data: PracticePlanEntity } | { error: unknown }) => {
          if ("error" in result) return;
          if (!result.data) return;
          navigate(`/practice-plans/${result.data._id}?edit=1`);
        },
      );
    }
    setOpenAddPracticePlanDialog(false);
  };

  const handleTagSelectionChange = (selectedTags: string[]) => {
    updatePracticePlanQueryAndResetResults(() => ({ tags: selectedTags }));
  };

  // Load more function
  const loadMore = useCallback(() => {
    if (
      practicePlansData &&
      practicePlanRequest.page < practicePlansData.pagination.pages
    ) {
      setPracticePlanRequest((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [practicePlansData, practicePlanRequest.page]);

  // Update effect to accumulate loaded practiceplans
  useEffect(() => {
    if (practicePlansData?.items) {
      setLoadedPracticePlans((prev) => {
        if (practicePlansData.pagination.page === 1) {
          return practicePlansData.items;
        }
        const newPracticePlanIds = new Set(
          practicePlansData.items.map((p) => p._id),
        );
        const filteredPrev = prev.filter((p) => !newPracticePlanIds.has(p._id));
        return [...filteredPrev, ...practicePlansData.items];
      });
    }
  }, [practicePlansData]);

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
                {t("PracticePlanList:title")}
              </SoftTypography>
            }
            action={
              <SoftBox display="flex" flexDirection="row" alignItems="center">
                {isUpMd && (
                  <SoftInput
                    id="outlined-basic"
                    placeholder={t("PracticePlanList:filter.name")}
                    value={practicePlanRequest.search}
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
                    {t("PracticePlanList:filter.sort.name")}
                  </InputLabel>
                  <Select
                    labelId="sort-select-label"
                    value={practicePlanRequest.sort}
                    label={t("PracticePlanList:filter.sort.name")}
                    onChange={(event) => {
                      updatePracticePlanQueryAndResetResults(() => ({
                        sort: event.target.value as
                          | "name"
                          | "created"
                          | "updated",
                      }));
                    }}
                  >
                    <MenuItem value="name">
                      {t("PracticePlanList:filter.sort.by_name")}
                    </MenuItem>
                    <MenuItem value="created">
                      {t("PracticePlanList:filter.sort.by_createdAt")}
                    </MenuItem>
                    <MenuItem value="updated">
                      {t("PracticePlanList:filter.sort.by_updatedAt")}
                    </MenuItem>
                  </Select>
                </FormControl>
                <ToggleButton
                  value={practicePlanRequest.direction}
                  selected={practicePlanRequest.direction === "desc"}
                  onChange={() => {
                    updatePracticePlanQueryAndResetResults((current) => ({
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
                    getAllPracticePlanTags();
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
                placeholder={t("PracticePlanList:filter.name")}
                value={practicePlanRequest.search}
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
                {t("PracticePlanList:filter.tags.title")}
              </SoftTypography>
              <Autocomplete
                multiple
                freeSolo
                size="small"
                options={allPracticePlanTagsData?.items ?? []}
                value={practicePlanRequest.tags}
                onChange={(_event, newValue) =>
                  handleTagSelectionChange(newValue)
                }
                loading={isAllPracticePlanTagsLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={t("PracticePlanList:filter.tags.placeholder")}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isAllPracticePlanTagsLoading ? (
                            <CircularProgress
                              color="inherit"
                              size={20}
                            />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <SoftBox
                sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <SoftTypography variant="caption">
                  {t("PracticePlanList:filter.tags.mode")}
                </SoftTypography>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={practicePlanRequest.tagMode}
                  onChange={(_, value) => {
                    if (value === "all" || value === "any") {
                      updatePracticePlanQueryAndResetResults(() => ({
                        tagMode: value,
                      }));
                    }
                  }}
                >
                  <ToggleButton value="all">
                    {t("PracticePlanList:filter.tags.matchAll")}
                  </ToggleButton>
                  <ToggleButton value="any">
                    {t("PracticePlanList:filter.tags.matchAny")}
                  </ToggleButton>
                </ToggleButtonGroup>
              </SoftBox>
              <SoftBox sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={practicePlanRequest.privacy === "private"}
                      onChange={() => {
                        updatePracticePlanQueryAndResetResults((current) => ({
                          privacy:
                            current.privacy === "private"
                              ? undefined
                              : "private",
                        }));
                      }}
                    />
                  }
                  label={t("PracticePlanList:filter.isPrivate")}
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
                  setOpenAddPracticePlanDialog(true);
                }}
              >
                {isUpMd ? t("PracticePlanList:addPracticePlan") : <AddIcon />}
              </SoftButton>
            )}
            <AddPracticePlanDialog
              isOpen={openAddPracticePlanDialog}
              onConfirm={(name: string | undefined) =>
                handleAddPracticePlan(name)
              }
            />
          </SoftBox>
          {isPracticePlansError && (
            <Alert color="error" sx={{ mt: 2 }}>
              {t("PracticePlanList:errorLoadingPracticePlans")}
            </Alert>
          )}
          {!isPracticePlansError && viewType === ViewType.Cards && (
            <>
              <SoftBox sx={{ mt: 2, flexGrow: 1, overflowY: "auto", p: 2 }}>
                <PracticePlanCardView
                  isPracticePlansLoading={isPracticePlansLoading}
                  onOpenPracticePlanClick={onOpenPracticePlanClick}
                  practicePlans={loadedPracticePlans}
                />
              </SoftBox>
              {practicePlansData &&
                practicePlanRequest.page <
                  practicePlansData.pagination.pages && (
                  <SoftBox
                    display="flex"
                    justifyContent="center"
                    sx={{ mt: 2, mb: 2 }}
                  >
                    <SoftButton
                      onClick={loadMore}
                      disabled={isPracticePlansLoading}
                    >
                      {t("PracticePlanList:loadMore")}
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

export default PracticePlanList;
