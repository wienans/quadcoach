import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import { Exercise } from "../../../api/quadcoachApi/domain";
import ExerciseAutocomplete from "./ExerciseAutocomplete";
import { SoftButton } from "../..";

export type EditRelatedExercisesDialogProps = {
  isOpen: boolean;
  /**
   * Called if closing dialog or cancel or add was clicked
   * @param selectedExercises if add was clicked, variable has selected exercises
   * @returns
   */
  onConfirm: (selectedExercises?: Exercise[]) => void;
  alreadyAddedExercises: Exercise[];
};

const AddRelatedExercisesDialog = ({
  isOpen,
  onConfirm,
  alreadyAddedExercises,
}: EditRelatedExercisesDialogProps): JSX.Element => {
  const [selectedRelatedExercises, setSelectedRelatedExercises] = useState<
    Exercise[]
  >([]);

  const onClose = (selectedExercises?: Exercise[]) => {
    onConfirm(selectedExercises);

    // reset
    setSelectedRelatedExercises([]);
  };

  return (
    <Dialog open={isOpen} onClose={() => onClose()}>
      <DialogTitle>Add Related Exercise</DialogTitle>
      <DialogContent>
        <ExerciseAutocomplete
          selectedExercises={selectedRelatedExercises}
          onExercisesSelectedChange={(selectedExercises) =>
            setSelectedRelatedExercises(selectedExercises)
          }
          alreadyAddedExercises={alreadyAddedExercises}
        />
      </DialogContent>
      <DialogActions>
        <SoftButton color="secondary" onClick={() => onClose()}>
          Cancel
        </SoftButton>
        <SoftButton
          color="primary"
          onClick={() => onClose(selectedRelatedExercises)}
        >
          Add
        </SoftButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddRelatedExercisesDialog;
