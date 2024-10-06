import "./translations";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  SelectChangeEvent,
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
  onConfirm: (name?: string, backgroundImage?: string) => void;
};

const AddTacticBoardDialog = ({
  isOpen,
  onConfirm,
}: AddTacticBoardDialogProps): JSX.Element => {
  const { t } = useTranslation("AddTacticBoardDialog");
  const [name, setName] = useState<string>("");
  const [backgroundImageId, setBackgorundImageId] =
    useState<string>("/full-court.svg");

  const onClose = (name?: string, backgroundImage?: string) => {
    onConfirm(name, backgroundImage);

    setName("");
    setBackgorundImageId("/full-court.svg");
  };

  return (
    <Dialog open={isOpen} onClose={() => onClose()}>
      <DialogTitle>{t("AddTacticBoardDialog:title")}</DialogTitle>
      <DialogContent>
        <SoftInput
          id="outlined-basic"
          placeholder="Name"
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value);
          }}
        />
        <Select
          labelId="court-select-label"
          id="court-select"
          sx={{ mt: 2 }}
          value={backgroundImageId}
          label={t("UpdateTacticBoardMeta:info.backgroundImage.label")}
          onChange={(event: SelectChangeEvent) => {
            setBackgorundImageId(event.target.value);
          }}
        >
          <MenuItem value={"/full-court.svg"}>Full Court</MenuItem>
          <MenuItem value={"/half-court.svg"}>Half Court</MenuItem>
          <MenuItem value={"/empty-court.svg"}>Empty Court</MenuItem>
        </Select>
      </DialogContent>
      <DialogActions>
        <SoftButton color="secondary" onClick={() => onClose()}>
          {t("AddTacticBoardDialog:cancel")}
        </SoftButton>
        <SoftButton
          color="primary"
          onClick={() => onClose(name, backgroundImageId)}
        >
          {t("AddTacticBoardDialog:add")}
        </SoftButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddTacticBoardDialog;
