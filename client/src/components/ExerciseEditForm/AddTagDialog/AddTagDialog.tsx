import "./translations";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import TagAutocomplete from "./TagAutocomplete";
import { SoftButton } from "../..";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("AddTagDialog");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const onClose = (selectedTags?: string[]) => {
    onConfirm(selectedTags);

    // reset
    setSelectedTags([]);
  };

  return (
    <Dialog open={isOpen} onClose={() => onClose()}>
      <DialogTitle>{t("AddTagDialog:title")}</DialogTitle>
      <DialogContent>
        <TagAutocomplete
          selectedTags={selectedTags}
          onTagSelectedChange={(selectedTags) => setSelectedTags(selectedTags)}
          alreadyAddedTags={alreadyAddedTags}
        />
      </DialogContent>
      <DialogActions>
        <SoftButton color="secondary" onClick={() => onClose()}>
          {t("AddTagDialog:cancel")}
        </SoftButton>
        <SoftButton color="primary" onClick={() => onClose(selectedTags)}>
          {t("AddTagDialog:add")}
        </SoftButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddTagDialog;
