import { Dialog, DialogActions, DialogContent, DialogTitle, Autocomplete, TextField } from "@mui/material";
import { useState } from "react";
import { Exercise } from "../../../api/quadcoachApi/domain";
import TagAutocomplete from "./TagAutocomplete";
import { SoftButton } from "../..";

export type AddTagDialogProps = {
    isOpen: boolean;
    /**
     * Called if closing dialog or cancel or add was clicked
     * @param selectedExercises if add was clicked, variable has selected exercises
     * @returns 
     */
    onConfirm: (selectedExercises?: Exercise[]) => void;
    alreadyAddedExercises: Exercise[];
}

const AddTagDialog = ({ isOpen, onConfirm, alreadyAddedExercises }: AddTagDialogProps): JSX.Element => {
    const [selectedTags, setSelectedTags] = useState<Exercise[]>([])

    const onClose = (selectedTags?: Exercise[]) => {
        onConfirm(selectedTags)

        // reset
        setSelectedTags([])
    }


    return (
        <Dialog open={isOpen} onClose={() => onClose()}>
            <DialogTitle>Add Tag</DialogTitle>
            <DialogContent>
                <TagAutocomplete
                    selectedExercises={selectedTags}
                    onTagSelectedChange={(selectedTags) => setSelectedTags(selectedTags)}
                    alreadyAddedExercises={alreadyAddedExercises}
                />
                {/* <Autocomplete
                    id="tag-text"
                    freeSolo
                    options={["Beater", "Chaser", "Keeper", "Warm-Up"]}
                    renderInput={(params) =>
                        <TextField
                            {...params}
                            autoFocus
                            id="name"
                            fullWidth
                            value={newTag}
                            onChange={(e) => { setNewTag(e.target.value) }}
                            onBlur={(e) => { setNewTag(e.target.value) }}
                        />
                    }
                /> */}
            </DialogContent>
            <DialogActions>
                <SoftButton color="secondary" onClick={() => onClose()}>Cancel</SoftButton>
                <SoftButton color="primary" onClick={() => onClose(selectedTags)}>Add</SoftButton>
            </DialogActions>
        </Dialog>
    );
}

export default AddTagDialog;