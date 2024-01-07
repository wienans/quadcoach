import "./translations";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import { SoftButton, SoftInput } from "..";
import { useTranslation } from "react-i18next";

export type AddTacticBoardDialogProps = {
  isOpen: boolean;
  /**
   * Called if closing dialog or cancel or add was clicked
   * @param selectedMaterials if add was clicked, variable has selected exercises
   * @returns
   */
  onConfirm: (name?: string) => void;
};

const AddTacticBoardDialog = ({
  isOpen,
  onConfirm,
}: AddTacticBoardDialogProps): JSX.Element => {
  const { t } = useTranslation("AddTacticBoardDialog");
  const [name, setName] = useState<string>("");

  const onClose = (name?: string) => {
    onConfirm(name);

    // reset
    setName("");
  };

  return (
    <Dialog open={isOpen} onClose={() => onClose()}>
      <DialogTitle>{t("AddTacticBoardDialog:title")}</DialogTitle>
      <DialogContent>
        <SoftInput
          id="outlined-basic"
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <SoftButton color="secondary" onClick={() => onClose()}>
          {t("AddTacticBoardDialog:cancel")}
        </SoftButton>
        <SoftButton color="primary" onClick={() => onClose(name)}>
          {t("AddTacticBoardDialog:add")}
        </SoftButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddTacticBoardDialog;
