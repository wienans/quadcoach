/* eslint-disable @typescript-eslint/no-explicit-any */
import "./translations";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Alert, Skeleton } from "@mui/material";
import * as fabric from "fabric";
import { useTranslation } from "react-i18next";
import { FabricJsCanvas, SoftBox } from "../../components";
import cloneDeep from "lodash/cloneDeep";
import {
  useCreateTacticBoardPageMutation,
  useDeleteTacticBoardMutation,
  useDeleteTacticBoardPageMutation,
  useGetAllTacticboardAccessUsersQuery,
  useGetTacticBoardQuery,
  useInsertTacticBoardPageMutation,
  useUpdateTacticBoardPageMutation,
} from "../../api/quadcoachApi/tacticboardApi";
import "../fullscreen.css";
import { TacticBoard, TacticPage } from "../../api/quadcoachApi/domain";
import {
  useTacticBoardCanvas,
  useTacticBoardData,
  useKeyboardShortcuts,
} from "../../hooks/taticBoard";
import { TacticBoardProvider } from "../../contexts/tacticBoard";
import Navbar from "../../components/Navbar";
import TacticBoardItemsDrawerNav from "./TacticBoardItemsDrawerNav";
import { useAppSelector } from "../../store/hooks";
import TacticBoardTopMenu from "./TacticBoardTopMenu/TacticBoardTopMenu";
import TacticBoardTopItemsMenu from "./TacticBoardTopItemsMenu";
import { useAuth } from "../../store/hooks";
import useVideoRecording from "../../hooks/taticBoard/useVideoRecording";

const TacticsBoard = (): JSX.Element => {
  const { t } = useTranslation("TacticBoard");
  const { id: tacticBoardId } = useParams();
  const {
    canvasFabricRef: canvasRef,
    setSelection,
    setControls,
    getAllObjects,
    removeActiveObjects,
  } = useTacticBoardCanvas();

  const { loadFromTacticPage: loadFromJson, getAllObjectsJson } =
    useTacticBoardData();

  // Enable keyboard shortcuts
  useKeyboardShortcuts({
    enableUndo: true,
    enableRedo: true,
    enableDelete: true,
    enableSelectAll: true,
  });
  const navigate = useNavigate();
  const refFullScreenContainer = useRef<HTMLDivElement>(null);
  const {
    data: tacticBoard,
    isError: isTacticBoardError,
    isLoading: isTacticBoardLoading,
  } = useGetTacticBoardQuery(tacticBoardId || "", {
    skip: tacticBoardId == null,
  });

  const { isRecording, startRecording, stopRecording, downloadVideo } =
    useVideoRecording();

  const [updateTacticBoardPage, { isLoading: isUpdatePageLoading }] =
    useUpdateTacticBoardPageMutation();
  const [createTacticBoardPage, { isLoading: isCreatePageLoading }] =
    useCreateTacticBoardPageMutation();
  const [insertTacticBoardPage, { isLoading: isInsertPageLoading }] =
    useInsertTacticBoardPageMutation();
  const [deleteTacticBoardPage, { isLoading: isDeletePageLoading }] =
    useDeleteTacticBoardPageMutation();
  const [deleteTacticBoard] = useDeleteTacticBoardMutation();

  const { data: accessUsers } = useGetAllTacticboardAccessUsersQuery(
    tacticBoardId || "",
  );

  const [currentPage, setPage] = useState<number>(1);
  const [maxPages, setMaxPages] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isPrivileged, setIsPrivileged] = useState<boolean>(false);
  const [firstAPICall, setFirstAPICall] = useState<number>(0);

  const isEditMode = useAppSelector((state) => state.tacticBoard.isEditMode);

  const { id: userId, roles: userRoles } = useAuth();

  const onDeleteActiveObject = () => {
    removeActiveObjects();
  };

  const onLoadPage = useCallback(
    (
      page: number,
      newPage?: boolean,
      removePage?: boolean,
      insertPage?: boolean,
    ) => {
      if (
        (newPage && removePage) ||
        (newPage && insertPage) ||
        (removePage && insertPage)
      )
        return;
      if (!tacticBoard) return;
      const updatedTacticBoard: TacticBoard = cloneDeep(tacticBoard);
      if (isPrivileged && isEditMode) {
        if (newPage) {
          updatedTacticBoard.pages[page - 1] = {
            ...updatedTacticBoard.pages[page - 1],
            ...getAllObjectsJson(),
          } as TacticPage;
          updateTacticBoardPage({
            tacticboardId: tacticBoard._id,
            pageId: updatedTacticBoard.pages[page - 2]._id,
            pageData: getAllObjectsJson(),
          });
          createTacticBoardPage({
            tacticboardId: tacticBoard._id,
            pageData: getAllObjectsJson(),
          });
        } else if (insertPage) {
          // Insert page after current page, duplicating current page content
          const currentPageData = getAllObjectsJson();
          const insertPosition = page; // Insert after current page (0-based index)

          // Save current page first
          updatedTacticBoard.pages[page - 1] = {
            ...updatedTacticBoard.pages[page - 1],
            ...currentPageData,
          } as TacticPage;

          updateTacticBoardPage({
            tacticboardId: tacticBoard._id,
            pageId: updatedTacticBoard.pages[page - 1]._id,
            pageData: currentPageData,
          });

          // Insert the duplicated page
          insertTacticBoardPage({
            tacticboardId: tacticBoard._id,
            position: insertPosition,
            pageData: currentPageData,
          });

          // Update local state - insert the duplicated page
          updatedTacticBoard.pages.splice(insertPosition, 0, {
            ...updatedTacticBoard.pages[page - 1],
            _id: "temp-" + Date.now(), // Temporary ID until refresh
          } as TacticPage);

          // Update maxPages and navigate to the new page
          const newMaxPages = updatedTacticBoard.pages.length;
          setMaxPages(newMaxPages);
          setPage(page + 1); // Navigate to the newly inserted page

          // Load the new page (adjust index since page numbers are 1-based)
          page = page + 1;
        } else if (removePage) {
          // Remove Current Page
          const currentPageIndex = page - 1;
          const pageToDelete = updatedTacticBoard.pages[currentPageIndex];

          deleteTacticBoardPage({
            tacticboardId: tacticBoard._id,
            pageId: pageToDelete._id,
          });

          // Remove the page from the array
          updatedTacticBoard.pages.splice(currentPageIndex, 1);

          // Update maxPages
          const newMaxPages = updatedTacticBoard.pages.length;
          setMaxPages(newMaxPages);

          // Determine new current page after deletion
          let newCurrentPage = page;
          if (page > newMaxPages) {
            // If we deleted the last page, go to the new last page
            newCurrentPage = newMaxPages;
          }
          // If we deleted a middle page, stay on the same page number (which now shows the next page)

          setPage(newCurrentPage);

          // Load the new current page (adjust index since page numbers are 1-based)
          page = newCurrentPage;
        } else if (page > currentPage) {
          // Go to next page
          updatedTacticBoard.pages[page - 2] = {
            ...updatedTacticBoard.pages[page - 2],
            ...getAllObjectsJson(),
          } as TacticPage;
          updateTacticBoardPage({
            tacticboardId: tacticBoard._id,
            pageId: updatedTacticBoard.pages[page - 2]._id,
            pageData: updatedTacticBoard.pages[page - 2],
          });
          //updateTacticBoard(updatedTacticBoard);
        } else if (page < currentPage) {
          // go to previous page
          updatedTacticBoard.pages[page] = {
            ...updatedTacticBoard.pages[page],
            ...getAllObjectsJson(),
          } as TacticPage;
          updateTacticBoardPage({
            tacticboardId: tacticBoard._id,
            pageId: updatedTacticBoard.pages[page]._id,
            pageData: updatedTacticBoard.pages[page],
          });
          //updateTacticBoard(updatedTacticBoard);
        }
      }
      loadFromJson(updatedTacticBoard.pages[page - 1]);

      if (isPrivileged && isEditMode) {
        setSelection(true);
      } else {
        setSelection(false);
      }
      setControls(false);
    },
    [
      tacticBoard,
      isPrivileged,
      isEditMode,
      loadFromJson,
      setControls,
      currentPage,
      getAllObjectsJson,
      updateTacticBoardPage,
      createTacticBoardPage,
      insertTacticBoardPage,
      deleteTacticBoardPage,
      setSelection,
    ],
  );

  const saveTacticBoard = useCallback(() => {
    if (!tacticBoard) return;
    const updatedTacticBoard: TacticBoard = cloneDeep(tacticBoard);
    updatedTacticBoard.pages[currentPage - 1] = {
      ...updatedTacticBoard.pages[currentPage - 1],
      ...getAllObjectsJson(),
    } as TacticPage;
    updateTacticBoardPage({
      tacticboardId: tacticBoard._id,
      pageId: updatedTacticBoard.pages[currentPage - 1]._id,
      pageData: getAllObjectsJson(),
    });
    //updateTacticBoard(updatedTacticBoard);
  }, [tacticBoard, currentPage, getAllObjectsJson, updateTacticBoardPage]);

  const onDeleteTacticBoardClick = () => {
    if (!tacticBoard) return;
    deleteTacticBoard(tacticBoard._id);
    navigate("/tacticboards");
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

  const onAnimateClick = () => {
    setIsAnimating(!isAnimating);
  };

  const onRecordClick = () => {
    const canvas = canvasRef.current?.getElement();
    if (!canvas || !tacticBoard) return;

    if (!isRecording) {
      startRecording(canvas, tacticBoard.pages.length, 2000);
    } else {
      stopRecording();
      downloadVideo(
        tacticBoard.name ? `${tacticBoard.name}.mp4` : "tacticboard.mp4",
      );
    }
  };

  useEffect(() => {
    if (
      !isTacticBoardLoading &&
      !isTacticBoardError &&
      tacticBoard &&
      firstAPICall < 2
    ) {
      // API is finished loading, due to sending data to Server every time the Page is switched
      // we need to stop the this method by counting firstAPICall up and checking the amount on
      // load of the page API is called twice.
      setFirstAPICall(firstAPICall + 1);
      loadFromJson(tacticBoard.pages[0]);
      setMaxPages(tacticBoard.pages.length);
      setSelection(false);
      setControls(false);
    }
  }, [
    loadFromJson,
    tacticBoard,
    isTacticBoardError,
    isTacticBoardLoading,
    firstAPICall,
    setSelection,
    setControls,
  ]);

  const targetByUuidMaps = useMemo(() => {
    if (!tacticBoard) return null;
    return tacticBoard.pages.map((page) => {
      const objects = page.objects ?? [];
      const map = new Map<string, (typeof objects)[number]>();
      objects.forEach((o) => {
        if (typeof (o as { uuid?: unknown }).uuid === "string") {
          map.set((o as { uuid: string }).uuid, o);
        }
      });
      return map;
    });
  }, [tacticBoard]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAnimating && tacticBoard) {
      interval = setInterval(() => {
        setPage((prevPage) => {
          const newPage = (prevPage % tacticBoard.pages.length) + 1;

          const targetByUuid = targetByUuidMaps?.[newPage - 1];
          if (!targetByUuid) {
            onLoadPage(newPage);
            return newPage;
          }

          const canvas = canvasRef.current;
          const requestRenderAll = () => {
            canvas?.requestRenderAll();
          };

          let pendingAnimations = 0;
          let didTriggerLoad = false;

          const triggerLoadOnce = () => {
            if (didTriggerLoad) return;
            didTriggerLoad = true;
            onLoadPage(newPage);
          };

          const onOneAnimationComplete = () => {
            pendingAnimations -= 1;
            if (pendingAnimations <= 0) {
              triggerLoadOnce();
            }
          };

          getAllObjects().forEach((obj) => {
            const objUuid = (obj as fabric.Object & { uuid?: unknown }).uuid;
            if (typeof objUuid !== "string") return;

            const targetObject = targetByUuid.get(objUuid);
            if (!targetObject || !canvas) return;

            const targetLeft = targetObject.left;
            const targetTop = targetObject.top;

            if (
              typeof targetLeft !== "number" ||
              typeof targetTop !== "number"
            ) {
              return;
            }

            const currentLeft = obj.left ?? 0;
            const currentTop = obj.top ?? 0;

            const shouldAnimateLeft = targetLeft !== currentLeft;
            const shouldAnimateTop = targetTop !== currentTop;

            if (!shouldAnimateLeft && !shouldAnimateTop) return;

            if (shouldAnimateLeft) {
              pendingAnimations += 1;
              (obj as any).animate("left", targetLeft, {
                onChange: requestRenderAll,
                duration: 1000,
                onComplete: onOneAnimationComplete,
              });
            }

            if (shouldAnimateTop) {
              pendingAnimations += 1;
              (obj as any).animate("top", targetTop, {
                onChange: requestRenderAll,
                duration: 1000,
                onComplete: onOneAnimationComplete,
              });
            }
          });

          if (pendingAnimations === 0) {
            triggerLoadOnce();
          }

          return newPage;
        });
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [isAnimating, onLoadPage, tacticBoard, getAllObjects, canvasRef, targetByUuidMaps]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording && tacticBoard) {
      interval = setInterval(() => {
        setPage((prevPage) => {
          const newPage = (prevPage % tacticBoard.pages.length) + 1;

          if (prevPage === tacticBoard.pages.length && newPage === 1) {
            stopRecording();
            downloadVideo(
              tacticBoard.name ? `${tacticBoard.name}.mp4` : "tacticboard.mp4",
            );
          }

          const targetByUuid = targetByUuidMaps?.[newPage - 1];
          if (!targetByUuid) {
            onLoadPage(newPage);
            return newPage;
          }

          const canvas = canvasRef.current;
          const requestRenderAll = () => {
            canvas?.requestRenderAll();
          };

          let pendingAnimations = 0;
          let didTriggerLoad = false;

          const triggerLoadOnce = () => {
            if (didTriggerLoad) return;
            didTriggerLoad = true;
            onLoadPage(newPage);
          };

          const onOneAnimationComplete = () => {
            pendingAnimations -= 1;
            if (pendingAnimations <= 0) {
              triggerLoadOnce();
            }
          };

          getAllObjects().forEach((obj) => {
            const objUuid = (obj as fabric.Object & { uuid?: unknown }).uuid;
            if (typeof objUuid !== "string") return;

            const targetObject = targetByUuid.get(objUuid);
            if (!targetObject || !canvas) return;

            const targetLeft = targetObject.left;
            const targetTop = targetObject.top;

            if (
              typeof targetLeft !== "number" ||
              typeof targetTop !== "number"
            ) {
              return;
            }

            const currentLeft = obj.left ?? 0;
            const currentTop = obj.top ?? 0;

            const shouldAnimateLeft = targetLeft !== currentLeft;
            const shouldAnimateTop = targetTop !== currentTop;

            if (!shouldAnimateLeft && !shouldAnimateTop) return;

            if (shouldAnimateLeft) {
              pendingAnimations += 1;
              (obj as any).animate("left", targetLeft, {
                onChange: requestRenderAll,
                duration: 1000,
                onComplete: onOneAnimationComplete,
              });
            }

            if (shouldAnimateTop) {
              pendingAnimations += 1;
              (obj as any).animate("top", targetTop, {
                onChange: requestRenderAll,
                duration: 1000,
                onComplete: onOneAnimationComplete,
              });
            }
          });

          if (pendingAnimations === 0) {
            triggerLoadOnce();
          }

          return newPage;
        });
      }, 2000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [
    isRecording,
    tacticBoard,
    stopRecording,
    downloadVideo,
    getAllObjects,
    canvasRef,
    onLoadPage,
    targetByUuidMaps,
  ]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement != null);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    if (
      userId == tacticBoard?.user ||
      userRoles.includes("Admin") ||
      userRoles.includes("admin")
    ) {
      setIsPrivileged(true);
    } else {
      if (accessUsers) {
        setIsPrivileged(
          accessUsers.some((user) => {
            return (
              user.user._id.toString() === userId && user.access === "edit"
            );
          }),
        );
      }
    }
  }, [userId, tacticBoard, userRoles, accessUsers]);

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
      {(isTacticBoardError || (!isTacticBoardLoading && !tacticBoard)) && (
        <SoftBox sx={{ px: 3 }}>
          <Alert color="error">
            {t("TacticBoard:loadingTacticBoardError")}
          </Alert>
        </SoftBox>
      )}
      {isTacticBoardLoading && (
        <>
          <SoftBox sx={{ px: 3, mb: 1 }}>
            <Skeleton variant="rectangular" width="100%" height={64} />
          </SoftBox>
          <SoftBox
            sx={{
              display: "flex",
              flexGrow: 1,
              px: 3,
            }}
          >
            <Skeleton variant="rectangular" width="100%" height="100%" />
          </SoftBox>
        </>
      )}
      {!isTacticBoardError && !isTacticBoardLoading && tacticBoard && (
        <div
          ref={refFullScreenContainer}
          style={{
            display: "flex",
            flexGrow: 1,
            maxHeight: "100%",
            minHeight: 0,
            flexDirection: "column",
          }}
        >
          <TacticBoardTopMenu
            saveTacticBoard={saveTacticBoard}
            isTacticBoardLoading={
              isTacticBoardLoading ||
              isUpdatePageLoading ||
              isCreatePageLoading ||
              isInsertPageLoading ||
              isDeletePageLoading
            }
            tacticBoard={tacticBoard}
            isPrivileged={isPrivileged}
            currentPage={currentPage}
            onLoadPage={onLoadPage}
            setPage={setPage}
            maxPages={maxPages}
            isAnimating={isAnimating}
            onAnimateClick={onAnimateClick}
            isRecording={isRecording}
            onRecordClick={onRecordClick}
            onDeleteTacticBoard={onDeleteTacticBoardClick}
            onFullScreenClick={onFullScreenClick}
            isFullScreen={isFullScreen}
          />
          <SoftBox
            sx={{
              display: "flex",
              flexGrow: 1,
              px: 3,
              minHeight: 0,
              overflow: "hidden",
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
                <TacticBoardTopItemsMenu
                  isPrivileged={isPrivileged}
                  isEditMode={isEditMode}
                  onDelete={onDeleteActiveObject}
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
      )}
    </SoftBox>
  );
};

const TacticsBoardWrapper = (): JSX.Element => {
  return (
    <TacticBoardProvider heightFirstResizing={true}>
      <TacticsBoard />
    </TacticBoardProvider>
  );
};

export default TacticsBoardWrapper;
