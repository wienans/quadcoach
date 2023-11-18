import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import TagAutocomplete from "./TagAutocomplete";
import { SoftButton } from "../..";

export type AddTagDialogProps = {
  isOpen: boolean;
  /**
   * Called if closing dialog or cancel or add was clicked
   * @param selectedTags if add was clicked, variable has selected exercises
   * @returns
   */
  onConfirm: (selectedTags?: string[]) => void;
  alreadyAddedTags: string[];
};

const AddTagDialog = ({
  isOpen,
  onConfirm,
  alreadyAddedTags,
}: AddTagDialogProps): JSX.Element => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const onClose = (selectedTags?: string[]) => {
    onConfirm(selectedTags);

    // reset
    setSelectedTags([]);
  };

  return (
    <Dialog open={isOpen} onClose={() => onClose()}>
      <DialogTitle>Add Tag</DialogTitle>
      <DialogContent>
        <TagAutocomplete
          selectedTags={selectedTags}
          onTagSelectedChange={(selectedTags) => setSelectedTags(selectedTags)}
          alreadyAddedTags={alreadyAddedTags}
        />
      </DialogContent>
      <DialogActions>
        <SoftButton color="secondary" onClick={() => onClose()}>
          Cancel
        </SoftButton>
        <SoftButton color="primary" onClick={() => onClose(selectedTags)}>
          Add
        </SoftButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddTagDialog;
