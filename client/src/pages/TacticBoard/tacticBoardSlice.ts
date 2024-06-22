import { PayloadAction, createSlice } from "@reduxjs/toolkit";

// Define a type for the slice state
interface TacticBoardSliceState {
  tacticBoardItemsDrawerOpen: boolean;
  tacticBoardItemsDrawerClosing: boolean;
  isEditMode: boolean;
}

const initialState: TacticBoardSliceState = {
  tacticBoardItemsDrawerOpen: true,
  tacticBoardItemsDrawerClosing: false,
  isEditMode: false,
};

export const tacticBoardSlice = createSlice({
  name: "tacticBoard",
  initialState,
  reducers: {
    closeTacticBoardItemsDrawer: (state) => {
      state.tacticBoardItemsDrawerOpen = false;
      state.tacticBoardItemsDrawerClosing = true;
    },
    setTacticBoardItemsDrawerClosing: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.tacticBoardItemsDrawerClosing = action.payload;
    },
    toggleTacticBoardItemsDrawerOpen: (state) => {
      if (state.tacticBoardItemsDrawerClosing) return;
      state.tacticBoardItemsDrawerOpen = !state.tacticBoardItemsDrawerOpen;
    },
    setIsEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditMode = action.payload;
    },
  },
});

export const {
  closeTacticBoardItemsDrawer,
  setTacticBoardItemsDrawerClosing,
  toggleTacticBoardItemsDrawerOpen,
  setIsEditMode,
} = tacticBoardSlice.actions;

export default tacticBoardSlice.reducer;
