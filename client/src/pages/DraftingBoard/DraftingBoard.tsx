import "./translations";
import "../TacticBoard/translations";
import { useState, useEffect, useRef, useCallback } from "react";
import { FabricJsCanvas, SoftBox } from "../../components";
import {
  useTacticBoardCanvas,
  useTacticBoardData,
  useKeyboardShortcuts,
} from "../../hooks/taticBoard";
import { TacticBoardProvider } from "../../contexts/tacticBoard";
import Navbar from "../../components/Navbar";
import TacticBoardItemsDrawerNav from "../TacticBoard/TacticBoardItemsDrawerNav";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import DraftingBoardTopItemsMenu from "./DraftingBoardTopItemsMenu";
import {
  setIsEditMode,
  toggleTacticBoardItemsDrawerOpen,
  setTacticBoardItemsDrawerClosing,
} from "../TacticBoard/tacticBoardSlice";
import "../fullscreen.css";

const DraftingBoardContent = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { setSelection, setControls, removeActiveObjects, setBackgroundImage } =
    useTacticBoardCanvas();

  const { loadFromTacticPage: loadFromJson } = useTacticBoardData();

  // Enable keyboard shortcuts
  useKeyboardShortcuts({
    enableUndo: true,
    enableRedo: true,
    enableDelete: true,
    enableSelectAll: true,
  });

  const refFullScreenContainer = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const drawerInitialized = useRef(false);

  const isEditMode = useAppSelector((state) => state.tacticBoard.isEditMode);
  const tacticBoardItemsDrawerOpen = useAppSelector(
    (state) => state.tacticBoard.tacticBoardItemsDrawerOpen,
  );

  const onDeleteActiveObject = () => {
    removeActiveObjects();
  };

  const onFullScreenClick = () => {
    const container = refFullScreenContainer.current;
    const isFullscreen = document.fullscreenElement;
    const doc = document as Document & {
      mozCancelFullScreen?: () => Promise<void>;
      webkitExitFullscreen?: () => Promise<void>;
      msExitFullscreen?: () => Promise<void>;
    };

    if (isFullscreen) {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    } else if (container) {
      const element = container as HTMLElement & {
        mozRequestFullScreen?: () => Promise<void>;
        webkitRequestFullscreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      };

      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
  };

  const onClearCanvas = useCallback(() => {
    // Clear all objects from canvas but keep the empty court background
    loadFromJson({
      _id: "draft",
      objects: [],
      backgroundImage: {
        type: "image",
        width: 800,
        height: 600,
        src: "/empty-court.svg",
      },
    });
    // Ensure the background image is set
    setBackgroundImage("/empty-court.svg");
  }, [loadFromJson, setBackgroundImage]);

  useEffect(() => {
    // Initialize with empty canvas and enable editing with empty court background
    loadFromJson({
      _id: "draft",
      objects: [],
      backgroundImage: {
        type: "image",
        width: 800,
        height: 600,
        src: "/empty-court.svg",
      },
    });
    // Set the background image directly
    setBackgroundImage("/empty-court.svg");
    // Enable edit mode for drafting
    dispatch(setIsEditMode(true));
    setSelection(true);
    setControls(false);

    // Cleanup function to disable edit mode when leaving the component
    return () => {
      dispatch(setIsEditMode(false));
    };
  }, [loadFromJson, setSelection, setControls, setBackgroundImage, dispatch]);

  // One-time initialization of drawer state
  useEffect(() => {
    if (!drawerInitialized.current) {
      drawerInitialized.current = true;

      // Reset drawer closing state to ensure toggle works
      dispatch(setTacticBoardItemsDrawerClosing(false));

      // Only open drawer if it's currently closed
      if (!tacticBoardItemsDrawerOpen) {
        dispatch(toggleTacticBoardItemsDrawerOpen());
      }
    }
  }, [dispatch, tacticBoardItemsDrawerOpen]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement != null);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  return (
    <SoftBox
      sx={{
        p: 3,
        position: "relative",
        height: "100vh",
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar light={false} />
      <div
        ref={refFullScreenContainer}
        style={{
          display: "flex",
          flexGrow: 1,
          maxHeight: "100%",
          flexDirection: "column",
        }}
      >
        <SoftBox
          sx={{
            display: "flex",
            flexGrow: 1,
            px: 3,
          }}
        >
          <TacticBoardItemsDrawerNav />
          <SoftBox
            sx={{
              display: "flex",
              flexGrow: 1,
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            {isEditMode && (
              <DraftingBoardTopItemsMenu
                isPrivileged={true}
                isEditMode={isEditMode}
                onDelete={onDeleteActiveObject}
                onClearCanvas={onClearCanvas}
                onFullScreenClick={onFullScreenClick}
                isFullScreen={isFullScreen}
              />
            )}
            <SoftBox
              component="main"
              sx={{
                display: "flex",
                minHeight: 0,
                flexGrow: 1,
                width: "100%",
              }}
            >
              <FabricJsCanvas />
            </SoftBox>
          </SoftBox>
        </SoftBox>
      </div>
    </SoftBox>
  );
};

const DraftingBoard = (): JSX.Element => {
  return (
    <TacticBoardProvider heightFirstResizing={true}>
      <DraftingBoardContent />
    </TacticBoardProvider>
  );
};

export default DraftingBoard;
