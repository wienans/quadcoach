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

export type AddPracticePlanDialogProps = {
  isOpen: boolean;
  /**
   * Called if closing dialog or cancel or add was clicked
   * @param name if add was clicked, variable has practice plan name
   * @param description if add was clicked, variable has practice plan description
   * @returns
   */
  onConfirm: (name?: string) => void;
};

const AddPracticePlanDialog = ({
  isOpen,
  onConfirm,
}: AddPracticePlanDialogProps): JSX.Element => {
  const { t } = useTranslation("AddPracticePlanDialog");
  const [name, setName] = useState<string>("");

  const onClose = (name?: string) => {
    onConfirm(name);

    setName("");
  };

  return (
    <Dialog open={isOpen} onClose={() => onClose()}>
      <DialogTitle>{t("AddPracticePlanDialog:title")}</DialogTitle>
      <DialogContent>
        <SoftInput
          id="outlined-basic"
          placeholder={t("AddPracticePlanDialog:name.placeholder")}
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value);
          }}
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <SoftButton color="secondary" onClick={() => onClose()}>
          {t("AddPracticePlanDialog:cancel")}
        </SoftButton>
        <SoftButton color="primary" onClick={() => onClose(name)}>
          {t("AddPracticePlanDialog:add")}
        </SoftButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddPracticePlanDialog;
