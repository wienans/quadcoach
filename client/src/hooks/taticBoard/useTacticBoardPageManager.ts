import { useCallback, useState } from "react";
import { TacticBoard, TacticPage } from "../../api/quadcoachApi/domain";
import {
  useCreateTacticBoardPageMutation,
  useDeleteTacticBoardPageMutation,
  useUpdateTacticBoardPageMutation,
} from "../../api/quadcoachApi/tacticboardApi";
import { useTacticBoardCanvas, useTacticBoardData } from ".";
import cloneDeep from "lodash/cloneDeep";

export interface TacticBoardPageManagerState {
  currentPage: number;
  maxPages: number;
  isAnimating: boolean;
}

export interface TacticBoardPageManagerActions {
  setPage: (page: number) => void;
  setMaxPages: (maxPages: number) => void;
  setIsAnimating: (animating: boolean) => void;
  onLoadPage: (page: number, newPage?: boolean, removePage?: boolean) => void;
  saveTacticBoard: () => void;
  initializeFromTacticBoard: (tacticBoard: TacticBoard) => void;
}

export interface TacticBoardPageManagerReturn
  extends TacticBoardPageManagerState,
    TacticBoardPageManagerActions {
  isLoading: boolean;
}

export const useTacticBoardPageManager = (
  tacticBoard: TacticBoard | undefined,
  isPrivileged: boolean,
  isEditMode: boolean,
): TacticBoardPageManagerReturn => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [maxPages, setMaxPages] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const { setSelection, setControls } = useTacticBoardCanvas();

  const { loadFromTacticPage: loadFromJson, getAllObjectsJson } =
    useTacticBoardData();

  const [updateTacticBoardPage, { isLoading: isUpdatePageLoading }] =
    useUpdateTacticBoardPageMutation();
  const [createTacticBoardPage, { isLoading: isCreatePageLoading }] =
    useCreateTacticBoardPageMutation();
  const [deleteTacticBoardPage, { isLoading: isDeletePageLoading }] =
    useDeleteTacticBoardPageMutation();

  const isLoading =
    isUpdatePageLoading || isCreatePageLoading || isDeletePageLoading;

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const setMaxPagesCallback = useCallback((pages: number) => {
    setMaxPages(pages);
  }, []);

  const setIsAnimatingCallback = useCallback((animating: boolean) => {
    setIsAnimating(animating);
  }, []);

  const initializeFromTacticBoard = useCallback(
    (board: TacticBoard) => {
      if (board.pages && board.pages.length > 0) {
        loadFromJson(board.pages[0]);
        setMaxPages(board.pages.length);
        setCurrentPage(1);
        setSelection(false);
        setControls(false);
      }
    },
    [loadFromJson, setSelection, setControls],
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
  }, [tacticBoard, currentPage, getAllObjectsJson, updateTacticBoardPage]);

  const onLoadPage = useCallback(
    (page: number, newPage?: boolean, removePage?: boolean) => {
      if (newPage && removePage) return;
      if (!tacticBoard) return;

      const updatedTacticBoard: TacticBoard = cloneDeep(tacticBoard);

      if (isPrivileged && isEditMode) {
        if (newPage) {
          // Create new page
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
        } else if (removePage) {
          // Remove last page
          deleteTacticBoardPage({
            tacticboardId: tacticBoard._id,
            pageId:
              updatedTacticBoard.pages[updatedTacticBoard.pages.length - 1]._id,
          });
          updatedTacticBoard.pages.pop();
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
        } else if (page < currentPage) {
          // Go to previous page
          updatedTacticBoard.pages[page] = {
            ...updatedTacticBoard.pages[page],
            ...getAllObjectsJson(),
          } as TacticPage;

          updateTacticBoardPage({
            tacticboardId: tacticBoard._id,
            pageId: updatedTacticBoard.pages[page]._id,
            pageData: updatedTacticBoard.pages[page],
          });
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
      deleteTacticBoardPage,
      setSelection,
    ],
  );

  return {
    currentPage,
    maxPages,
    isAnimating,
    isLoading,
    setPage,
    setMaxPages: setMaxPagesCallback,
    setIsAnimating: setIsAnimatingCallback,
    onLoadPage,
    saveTacticBoard,
    initializeFromTacticBoard,
  };
};
