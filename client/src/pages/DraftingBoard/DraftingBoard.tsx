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
import { cloneDeep } from "lodash";
import { PersonType } from "../../contexts/tacticBoard/TacticBoardFabricJsContext/types";
import { v4 as uuidv4 } from "uuid";
import {
  createExtendedCircle,
  createExtendedText,
  createExtendedGroup,
  setUuid,
  setObjectType,
} from "../../contexts/tacticBoard/TacticBoardFabricJsContext/fabricTypes";
import "../fullscreen.css";

// Team colors from PersonItemsSection
const teamAInfo = {
  color: "#3d85c6",
};
const teamBInfo = {
  color: "#dd2d2d",
};

// Helper function to get player stroke color based on person type
const getFabricPersonColor = (personType: PersonType): string | undefined => {
  switch (personType) {
    case PersonType.Beater:
      return "#000000";
    case PersonType.Chaser:
      return "#ffffff";
    case PersonType.Keeper:
      return "#03fc35";
    case PersonType.Seeker:
      return "#fcfc00";
  }
};

const DraftingBoardContent = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const {
    setSelection,
    setControls,
    removeActiveObjects,
    setBackgroundImage,
    addObject,
  } = useTacticBoardCanvas();
  const { getAllObjectsJson } = useTacticBoardData();

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

  // Helper function to create a player at specific position
  const createPlayer = useCallback(
    (
      personType: PersonType,
      teamA: boolean,
      left: number,
      top: number,
      playerNumber: number,
    ) => {
      const circle = createExtendedCircle({
        radius: 15,
        left,
        top,
        stroke: getFabricPersonColor(personType),
        strokeWidth: 3,
        fill: teamA ? teamAInfo.color : teamBInfo.color,
      });
      setUuid(circle, uuidv4());

      const text = createExtendedText(playerNumber.toString(), {
        left: left + 16,
        top: top + 16,
        fontFamily: "Arial",
        fontSize: 20,
        textAlign: "center",
        originX: "center",
        originY: "center",
      });
      setUuid(text, uuidv4());

      const group = createExtendedGroup([circle, text], {
        hasControls: false, // Disable resizing handles
      });
      setUuid(group, uuidv4());
      setObjectType(group, teamA ? "playerA" : "playerB");
      addObject(group);
    },
    [addObject],
  );
  const findNumberInArray = (array: number[]) => {
    const clonedArray = cloneDeep(array);
    clonedArray.sort(function (a, b) {
      return a - b;
    });

    let lowest = -1;
    for (let i = 0; i < clonedArray.length; ++i) {
      if (clonedArray[i] != i) {
        lowest = i;
        break;
      }
    }
    if (lowest == -1) {
      lowest = clonedArray[clonedArray.length - 1] + 1;
    }
    return lowest;
  };
  const getNextNumber = useCallback(
    (teamA: boolean) => {
      let numbers: number[] = [0];
      (
        getAllObjectsJson() as {
          objects: Array<{
            objectType?: string;
            objects?: Array<{ text?: string }>;
          }>;
        }
      ).objects.forEach((obj) => {
        if (obj.objectType == (teamA ? "playerA" : "playerB")) {
          numbers = [...numbers, parseInt(obj.objects?.[1]?.text || "0")];
        }
      });
      return findNumberInArray(numbers);
    },
    [getAllObjectsJson],
  );
  // Function to add default players for both teams
  const addDefaultPlayers = useCallback(() => {
    // Team A (left side) positions - avoiding overlap with proper spacing
    const teamABaseX = 220;
    const teamAPositions = [
      { type: PersonType.Keeper, x: teamABaseX, y: 150 },
      { type: PersonType.Chaser, x: teamABaseX, y: 200 },
      { type: PersonType.Chaser, x: teamABaseX, y: 250 },
      { type: PersonType.Chaser, x: teamABaseX, y: 300 },
      { type: PersonType.Beater, x: teamABaseX, y: 350 },
      { type: PersonType.Beater, x: teamABaseX, y: 400 },
    ];

    // Team B (right side) positions - mirror Team A
    const teamBBaseX = 980;
    const teamBPositions = [
      { type: PersonType.Keeper, x: teamBBaseX, y: 150 },
      { type: PersonType.Chaser, x: teamBBaseX, y: 200 },
      { type: PersonType.Chaser, x: teamBBaseX, y: 250 },
      { type: PersonType.Chaser, x: teamBBaseX, y: 300 },
      { type: PersonType.Beater, x: teamBBaseX, y: 350 },
      { type: PersonType.Beater, x: teamBBaseX, y: 400 },
    ];

    // Add Team A players
    teamAPositions.forEach((pos) => {
      createPlayer(pos.type, true, pos.x, pos.y, getNextNumber(true));
    });

    // Add Team B players
    teamBPositions.forEach((pos) => {
      createPlayer(pos.type, false, pos.x, pos.y, getNextNumber(false));
    });
  }, [createPlayer, getNextNumber]);

  useEffect(() => {
    // Initialize with empty canvas and enable editing with empty court background
    loadFromJson({
      _id: "draft",
      objects: [],
      backgroundImage: {
        type: "image",
        width: 800,
        height: 600,
        src: "/half-court.svg",
      },
    });
    // Set the background image directly
    setBackgroundImage("/half-court.svg");
    // Enable edit mode for drafting
    dispatch(setIsEditMode(true));
    setSelection(true);
    setControls(false);

    // Add default players after a small delay to ensure canvas is ready
    const timer = setTimeout(() => {
      addDefaultPlayers();
    }, 100);

    // Cleanup function to disable edit mode when leaving the component
    return () => {
      dispatch(setIsEditMode(false));
      clearTimeout(timer);
    };
  }, [
    loadFromJson,
    setSelection,
    setControls,
    setBackgroundImage,
    dispatch,
    addDefaultPlayers,
  ]);

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
