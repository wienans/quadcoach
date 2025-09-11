import { PayloadAction, createSlice } from "@reduxjs/toolkit";

// Define a type for the slice state
interface ExerciseSliceState {
  isEditMode: boolean;
}

const initialState: ExerciseSliceState = {
  isEditMode: false,
};

export const exerciseSlice = createSlice({
  name: "exercise",
  initialState,
  reducers: {
    setIsEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditMode = action.payload;
    },
  },
});

export const { setIsEditMode } = exerciseSlice.actions;

export default exerciseSlice.reducer;