import "./translations";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState } from "react";
import MaterialAutocomplete from "./MaterialAutocomplete";
import { SoftButton } from "../..";
import { useTranslation } from "react-i18next";

export type AddMaterialDialogProps = {
  isOpen: boolean;
  /**
   * Called if closing dialog or cancel or add was clicked
   * @param selectedMaterials if add was clicked, variable has selected exercises
   * @returns
   */
  onConfirm: (selectedMaterials?: string[]) => void;
  alreadyAddedMaterials: string[];
};

const AddMaterialDialog = ({
  isOpen,
  onConfirm,
  alreadyAddedMaterials,
}: AddMaterialDialogProps): JSX.Element => {
  const { t } = useTranslation("AddMaterialDialog");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  const onClose = (selectedMaterials?: string[]) => {
    onConfirm(selectedMaterials);

    // reset
    setSelectedMaterials([]);
  };

  return (
    <Dialog open={isOpen} onClose={() => onClose()}>
      <DialogTitle>{t("AddMaterialDialog:title")}</DialogTitle>
      <DialogContent>
        <MaterialAutocomplete
          selectedMaterials={selectedMaterials}
          onMaterialSelectedChange={(selectedMaterials) =>
            setSelectedMaterials(selectedMaterials)
          }
          alreadyAddedMaterials={alreadyAddedMaterials}
        />
      </DialogContent>
      <DialogActions>
        <SoftButton color="secondary" onClick={() => onClose()}>
          {t("AddMaterialDialog:cancel")}
        </SoftButton>
        <SoftButton color="primary" onClick={() => onClose(selectedMaterials)}>
          {t("AddMaterialDialog:add")}
        </SoftButton>
      </DialogActions>
    </Dialog>
  );
};

export default AddMaterialDialog;
