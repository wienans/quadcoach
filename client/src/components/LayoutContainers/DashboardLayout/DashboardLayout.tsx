import SoftBox from "../../SoftBox";
import { ReactNode } from "react";
import Navbar from "../../Navbar";
import { useScrollTrigger, IconButton } from "@mui/material";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";

export type DashboardLayoutProps = {
  children: (scrollTrigger: boolean) => ReactNode;
  header: (scrollTrigger: boolean) => ReactNode;
  showScrollToTopButton?: (scrollTrigger: boolean) => boolean;
};

const DashboardLayout = ({
  children,
  header,
  showScrollToTopButton,
}: DashboardLayoutProps) => {
  const scrollTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  return (
    <SoftBox
      sx={{
        p: 3,
        position: "relative",
      }}
    >
      <Navbar light={false} />
      <SoftBox
        sx={(theme) => ({
          px: 1,
          [theme.breakpoints.up("sm")]: {
            px: 2,
          },
          flexGrow: 1,
        })}
      >
        <SoftBox
          sx={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {header(scrollTrigger)}
          {children(scrollTrigger)}
        </SoftBox>
      </SoftBox>
      {showScrollToTopButton?.(scrollTrigger) && (
        <IconButton
          onClick={() => window.scrollTo(0, 0)}
          sx={{ position: "fixed", bottom: 16, right: 16 }}
        >
          <ArrowCircleUpIcon />
        </IconButton>
      )}
    </SoftBox>
  );
};

export default DashboardLayout;
