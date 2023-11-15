import "./translations";
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
import { useTranslation } from "react-i18next";

export type AddRelatedExercisesDialogProps = {
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
}: AddRelatedExercisesDialogProps): JSX.Element => {
  const { t } = useTranslation("AddRelatedExercisesDialog");
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
      <DialogTitle>{t("AddRelatedExercisesDialog:title")}</DialogTitle>
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
        <SoftButton
          color="primary"
          onClick={() => onClose(selectedRelatedExercises)}
        >
          {t("AddRelatedExercisesDialog:add")}
        </SoftButton>
        <SoftButton color="secondary" onClick={() => onClose()}>
          {t("AddRelatedExercisesDialog:cancel")}
        </SoftButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddRelatedExercisesDialog;
