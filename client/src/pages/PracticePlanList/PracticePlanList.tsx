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
  useLazyGetPracticePlanHeadersQuery,
  useCreatePracticePlanMutation,
} from "../../api/quadcoachApi/practicePlansApi";
import { useTranslation } from "react-i18next";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import PracticePlanCardView from "./cardView/PracticePlanCardView";
import AddIcon from "@mui/icons-material/Add";
import { DashboardLayout } from "../../components/LayoutContainers";
import { useAuth } from "../../store/hooks";
import Footer from "../../components/Footer";
import {
  PracticePlanHeader,
  PracticePlanEntity,
  PracticePlanEntityPartialId,
} from "../../api/quadcoachApi/domain/PracticePlan";
import debounce from "lodash/debounce";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { Chip } from "@mui/material";

enum ViewType {
  List = "List",
  Cards = "Cards",
}

type PracticePlanFilter = {
  searchValue: string;
  tagRegex: string;
  tagList: string[];
  page: number;
  limit: number;
};

const defaultPracticePlanFilter: PracticePlanFilter = {
  searchValue: "",
  tagRegex: "",
  tagList: [],
  page: 1,
  limit: 50,
};

const PracticePlanList = () => {
  const { t } = useTranslation("PracticePlanList");
  const navigate = useNavigate();
  const isUpMd = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  const { id: userId, status: userStatus } = useAuth();

  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [viewType, setViewType] = useState<ViewType>(ViewType.Cards);
  const [openAddPracticePlanDialog, setOpenAddPracticePlanDialog] =
    useState<boolean>(false);

  useEffect(() => {
    if (isUpMd) return;
    setViewType(ViewType.Cards);
  }, [isUpMd]);

  const [loadedPracticePlans, setLoadedPracticePlans] = useState<
    PracticePlanHeader[]
  >([]);

  const [practicePlanFilter, setPracticePlanFilter] =
    useState<PracticePlanFilter>(defaultPracticePlanFilter);

  const [
    getPracticePlans,
    {
      data: practicePlansData,
      isError: isPracticePlansError,
      isLoading: isPracticePlansLoading,
    },
  ] = useLazyGetPracticePlanHeadersQuery();

  // Create debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((filter: PracticePlanFilter) => {
      getPracticePlans({
        nameRegex: filter.searchValue,
        tagRegex: filter.tagRegex,
        tagList: filter.tagList,
        page: filter.page,
        limit: filter.limit,
      });
    }, 300),
    [getPracticePlans],
  );

  // Update the filter change handler
  const onPracticePlanFilterValueChange =
    (practicePlanFilterProperty: keyof PracticePlanFilter) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setLoadedPracticePlans([]);
      setPracticePlanFilter({
        ...practicePlanFilter,
        [practicePlanFilterProperty]: event.target.value,
        page: 1,
      });
    };

  // Cleanup
  useEffect(() => {
    debouncedSearch(practicePlanFilter);
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch, practicePlanFilter]);

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

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && practicePlanFilter.tagRegex.trim() !== "") {
      event.preventDefault();
      setLoadedPracticePlans([]);
      setPracticePlanFilter({
        ...practicePlanFilter,
        tagList: [
          ...practicePlanFilter.tagList,
          practicePlanFilter.tagRegex.trim(),
        ],
        tagRegex: "",
        page: 1,
      });
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setLoadedPracticePlans([]);
    setPracticePlanFilter({
      ...practicePlanFilter,
      tagList: practicePlanFilter.tagList.filter((tag) => tag !== tagToDelete),
      page: 1,
    });
  };

  // Load more function
  const loadMore = useCallback(() => {
    if (
      practicePlansData &&
      practicePlanFilter.page < practicePlansData.pagination.pages
    ) {
      setPracticePlanFilter((prev) => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  }, [practicePlansData, practicePlanFilter.page]);

  // Update effect to accumulate loaded practiceplans
  useEffect(() => {
    if (practicePlansData?.practiceplans) {
      setLoadedPracticePlans((prev) => {
        const newPracticePlanIds = new Set(
          practicePlansData.practiceplans.map((p) => p._id),
        );
        const filteredPrev = prev.filter((p) => !newPracticePlanIds.has(p._id));
        return [...filteredPrev, ...practicePlansData.practiceplans];
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
                    value={practicePlanFilter.searchValue}
                    onChange={onPracticePlanFilterValueChange("searchValue")}
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
                placeholder={t("PracticePlanList:filter.name")}
                value={practicePlanFilter.searchValue}
                onChange={onPracticePlanFilterValueChange("searchValue")}
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
                    {t("PracticePlanList:filter.tags.title")}
                  </SoftTypography>
                  <SoftInput
                    id="outlined-basic"
                    placeholder={t("PracticePlanList:filter.tags.placeholder")}
                    value={practicePlanFilter.tagRegex}
                    onChange={onPracticePlanFilterValueChange("tagRegex")}
                    onKeyDown={handleTagKeyDown}
                    sx={{ width: "100%" }}
                    endAdornment={
                      <InputAdornment position="end">
                        <KeyboardReturnIcon
                          sx={{
                            fontSize: 20,
                            opacity:
                              practicePlanFilter.tagRegex != "" ? 1 : 0.4,
                          }}
                        />
                      </InputAdornment>
                    }
                  />
                  <SoftBox
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}
                  >
                    {practicePlanFilter.tagList.map((tag) => (
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
                practicePlanFilter.page <
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
