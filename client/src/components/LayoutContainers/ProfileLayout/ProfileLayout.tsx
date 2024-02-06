import {
  BottomNavigation,
  BottomNavigationAction,
  Card,
  Fade,
  Icon,
  IconButton,
  Paper,
  Skeleton,
  Theme,
  useScrollTrigger,
} from "@mui/material";
import { ReactNode } from "react";
import { SoftBox, SoftTypography } from "../..";
import Navbar from "../../Navbar";
import curved0 from "../../../assets/images/curved-images/curved0.jpg";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setMiniSideNav } from "../../Layout/layoutSlice";

const defaultHeaderBackgroundImage = ({
  functions: { rgba, linearGradient },
  palette: { gradients },
}: Theme): string =>
  `${linearGradient(
    rgba(gradients.info.main, 0.6),
    rgba(gradients.info.state, 0.6),
  )}, url(${curved0})`;

export type ProfileLayoutProps = {
  children: (scrollTrigger: boolean) => ReactNode;
  title?: string;
  headerBackgroundImage?: string;
  isDataLoading?: boolean;
  headerAction?: ReactNode;
  showScrollToTopButton?: (scrollTrigger: boolean) => boolean;
  bottomNavigation?: ReactNode;
};

const ProfileLayout = ({
  children,
  title,
  headerBackgroundImage,
  headerAction,
  showScrollToTopButton,
  bottomNavigation,
  isDataLoading = false,
}: ProfileLayoutProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const scrollTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });
  const miniSidenav = useAppSelector((state) => state.layout.miniSidenav);

  const handleMiniSidenav = () => {
    dispatch(setMiniSideNav(!miniSidenav));
  };

  return (
    <SoftBox
      sx={{
        p: 3,
        position: "relative",
      }}
    >
      <SoftBox
        display="flex"
        flexDirection="column"
        alignItems="center"
        position="relative"
        minHeight={(theme) => theme.spacing(18)}
        borderRadius="xl"
        sx={(theme) => ({
          backgroundImage:
            headerBackgroundImage ?? defaultHeaderBackgroundImage(theme),
          backgroundSize: "cover",
          backgroundPosition: "50%",
          overflow: "hidden",
        })}
      >
        <Navbar light />
      </SoftBox>
      <Card
        sx={(theme) => ({
          backdropFilter: `saturate(200%) blur(30px)`,
          backgroundColor: ({ functions: { rgba }, palette: { white } }) =>
            rgba(white.main, 0.8),
          boxShadow: ({ boxShadows: { navbarBoxShadow } }) => navbarBoxShadow,
          ...(scrollTrigger
            ? {
                position: "fixed",
                width: "100%",
                top: 0,
                left: 0,
                m: 0,
                p: 2,
                zIndex: 4,
                borderRadius: 0,
              }
            : {
                position: "relative",
                mt: -5,
                mb: 5,
                mx: 2,
                p: 2,
                width: `calc(100% - 2 * ${theme.spacing(2)})`,
              }),
          transition: "0.3s all",
        })}
      >
        {isDataLoading ? (
          <Skeleton variant="rectangular" width="100%" />
        ) : (
          <SoftBox
            sx={{
              display: "flex",
            }}
          >
            <SoftTypography
              sx={{
                minWidth: 0,
                flexGrow: 1,
                wordBreak: "break-all",
                mr: 1,
              }}
            >
              {title ?? ""}
            </SoftTypography>
            <SoftBox>{headerAction}</SoftBox>
          </SoftBox>
        )}
      </Card>
      {children(scrollTrigger)}
      {showScrollToTopButton?.(scrollTrigger) && (
        <IconButton
          onClick={() => window.scrollTo(0, 0)}
          sx={{ position: "fixed", bottom: 16, right: 16 }}
        >
          <ArrowCircleUpIcon />
        </IconButton>
      )}
      {bottomNavigation && (
        <Paper
          sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
          elevation={3}
        >
          <BottomNavigation showLabels={false}>
            <BottomNavigationAction
              icon={<Icon>{miniSidenav ? "menu_open" : "menu"}</Icon>}
              onClick={handleMiniSidenav}
            />
            {bottomNavigation}
            {scrollTrigger && (
              <Fade in={scrollTrigger}>
                <BottomNavigationAction
                  icon={<ArrowCircleUpIcon />}
                  onClick={() => window.scrollTo(0, 0)}
                />
              </Fade>
            )}
          </BottomNavigation>
        </Paper>
      )}
    </SoftBox>
  );
};

export default ProfileLayout;
