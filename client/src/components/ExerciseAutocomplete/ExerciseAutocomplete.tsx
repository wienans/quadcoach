import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useState } from "react";
import { useGetExercisesQuery } from "../../pages/exerciseApi";
import { Exercise } from "../../api/quadcoachApi/domain";

export type ExerciseAutocompleteProps = {
    onExercisesSelectedChange: (newSelectedExercises: Exercise[]) => void;
}

const ExerciseAutocomplete = ({ onExercisesSelectedChange }: ExerciseAutocompleteProps): JSX.Element => {
    const [searchValue, setSearchValue] = useState<string>("");
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])
    const { data: exercises, isLoading: isExercisesLoading, } = useGetExercisesQuery({
        nameRegex: searchValue !== "" ? searchValue : undefined,
    })

    return (
        <Autocomplete
            id="related-text"
            multiple
            options={exercises ?? []}
            getOptionLabel={exercise => exercise.name}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            inputValue={searchValue}
            onInputChange={(_event, newValue) => setSearchValue(newValue)}
            value={selectedExercises}
            onChange={(_event, newValue) => { setSelectedExercises(newValue); onExercisesSelectedChange(newValue) }}
            loading={isExercisesLoading}
            renderInput={(params) =>
                <TextField
                    {...params}
                    autoFocus
                    id="name"
                    fullWidth
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {isExercisesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            }
        />
    );
}

export default ExerciseAutocomplete;
