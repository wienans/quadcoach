import { Collapse, Drawer, Theme, useMediaQuery } from "@mui/material";
import { SoftBox } from "../../../components";
import TacticBoardItemsDrawer from "./TacticBoardItemsDrawer";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  closeTacticBoardItemsDrawer,
  setTacticBoardItemsDrawerClosing,
} from "../tacticBoardSlice";

export const tacticBoardItemsDrawerWidth = 240;

const TacticBoardItemsDrawerNav = (): JSX.Element | null => {
  const dispatch = useAppDispatch();
  //@ts-ignore
  const isUpSm = useMediaQuery((theme: Theme) => theme.breakpoints.up("xxxl"));

  const tacticBoardItemsDrawerOpen = useAppSelector(
    (state) => state.tacticBoard.tacticBoardItemsDrawerOpen,
  );
  const isEditMode = useAppSelector((state) => state.tacticBoard.isEditMode);

  const handleDrawerClose = () => {
    dispatch(closeTacticBoardItemsDrawer());
  };

  const handleDrawerTransitionEnd = () => {
    dispatch(setTacticBoardItemsDrawerClosing(false));
  };

  if (!isEditMode) return null;

  return (
    <SoftBox
      component="nav"
      sx={(theme) => ({
        width:
          isUpSm && tacticBoardItemsDrawerOpen
            ? tacticBoardItemsDrawerWidth
            : undefined,
        flexShrink: { sm: 0 },
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.standard,
        }),
        backgroundColor: theme.palette.background.paper,
      })}
      aria-label="tactic board items menu"
    >
      {isUpSm ? (
        <Collapse
          orientation="horizontal"
          in={tacticBoardItemsDrawerOpen}
          sx={{ height: "100%", backgroundColor: "background.paper" }}
        >
          <SoftBox
            sx={{
              bgcolor: "background.paper",
              width: tacticBoardItemsDrawerWidth,
              height: "100%",
            }}
          >
            <TacticBoardItemsDrawer />
          </SoftBox>
        </Collapse>
      ) : (
        <Drawer
          variant="temporary"
          open={tacticBoardItemsDrawerOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "block", xl: "block", xxl: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: tacticBoardItemsDrawerWidth,
            },
          }}
        >
          <TacticBoardItemsDrawer />
        </Drawer>
      )}
    </SoftBox>
  );
};

export default TacticBoardItemsDrawerNav;
