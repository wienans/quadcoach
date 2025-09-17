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
import { setIsEditMode, toggleTacticBoardItemsDrawerOpen, setTacticBoardItemsDrawerClosing } from "../TacticBoard/tacticBoardSlice";
import { PersonType, BallType } from "../../contexts/tacticBoard/TacticBoardFabricJsContext/types";
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

//  Helper function to get player stroke color based on person type
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

// Helper function to get ball color based on ball type
const getBallTypeColor = (ballType: BallType): string => {
  switch (ballType) {
    case BallType.Dodgeball:
      return "#808080";
    case BallType.Volleyball:
      return "#ffffff";
    case BallType.FlagRunner:
      return "#FFD700";
    case BallType.Bludger:
      return "#8B4513"; // Brown color for bludgers
    case BallType.Quaffle:
      return "#DC143C"; // Crimson red for quaffle
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
  const tacticBoardItemsDrawerOpen = useAppSelector((state) => state.tacticBoard.tacticBoardItemsDrawerOpen);

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
  const createPlayer = useCallback((personType: PersonType, teamA: boolean, left: number, top: number, playerNumber: number) => {
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
  }, [addObject]);

  // Helper function to create a ball at specific position
  const createBall = useCallback((ballType: BallType, left: number, top: number) => {
    const circle = createExtendedCircle({
      radius: 10,
      left,
      top,
      stroke: "#000000",
      strokeWidth: 2,
      fill: getBallTypeColor(ballType),
      hasControls: false, // Disable resizing handles
    });
    setUuid(circle, uuidv4());
    addObject(circle);
  }, [addObject]);

  // Function to add default players for both teams
  const addDefaultPlayers = useCallback(() => {
    let playerNumber = 0;
    
    // Team A (left side) positions - avoiding overlap with proper spacing
    const teamABaseX = 200;
    const teamAPositions = [
      { type: PersonType.Keeper, x: teamABaseX, y: 300 }, // Keeper center-left
      { type: PersonType.Chaser, x: teamABaseX - 50, y: 200 }, // Chaser 1 top-left
      { type: PersonType.Chaser, x: teamABaseX + 50, y: 200 }, // Chaser 2 top-right  
      { type: PersonType.Chaser, x: teamABaseX, y: 150 }, // Chaser 3 center-top
      { type: PersonType.Beater, x: teamABaseX - 50, y: 400 }, // Beater 1 bottom-left
      { type: PersonType.Beater, x: teamABaseX + 50, y: 400 }, // Beater 2 bottom-right
    ];

    // Team B (right side) positions - mirror Team A
    const teamBBaseX = 950;
    const teamBPositions = [
      { type: PersonType.Keeper, x: teamBBaseX, y: 300 }, // Keeper center-right
      { type: PersonType.Chaser, x: teamBBaseX - 50, y: 200 }, // Chaser 1 top-left
      { type: PersonType.Chaser, x: teamBBaseX + 50, y: 200 }, // Chaser 2 top-right
      { type: PersonType.Chaser, x: teamBBaseX, y: 150 }, // Chaser 3 center-top
      { type: PersonType.Beater, x: teamBBaseX - 50, y: 400 }, // Beater 1 bottom-left
      { type: PersonType.Beater, x: teamBBaseX + 50, y: 400 }, // Beater 2 bottom-right
    ];

    // Add Team A players
    teamAPositions.forEach(pos => {
      createPlayer(pos.type, true, pos.x, pos.y, playerNumber++);
    });

    // Add Team B players  
    teamBPositions.forEach(pos => {
      createPlayer(pos.type, false, pos.x, pos.y, playerNumber++);
    });

    // Add balls - 3 bludgers and 1 quaffle positioned in center field
    const ballPositions = [
      { type: BallType.Quaffle, x: 600, y: 300 }, // Quaffle in center
      { type: BallType.Bludger, x: 550, y: 250 }, // Bludger 1 center-left
      { type: BallType.Bludger, x: 650, y: 250 }, // Bludger 2 center-right  
      { type: BallType.Bludger, x: 600, y: 350 }, // Bludger 3 center-bottom
    ];

    // Add balls to the field
    ballPositions.forEach(pos => {
      createBall(pos.type, pos.x, pos.y);
    });
  }, [createPlayer, createBall]);

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

    // Add default players after a small delay to ensure canvas is ready
    const timer = setTimeout(() => {
      addDefaultPlayers();
    }, 100);

    // Cleanup function to disable edit mode when leaving the component
    return () => {
      dispatch(setIsEditMode(false));
      clearTimeout(timer);
    };
  }, [loadFromJson, setSelection, setControls, setBackgroundImage, dispatch, addDefaultPlayers]);

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