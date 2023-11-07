import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useState } from "react";
import { useGetExercisesQuery } from "../../../pages/exerciseApi";
import { Exercise } from "../../../api/quadcoachApi/domain";

export type ExerciseAutocompleteProps = {
  selectedExercises: Exercise[];
  onExercisesSelectedChange: (selectedExercises: Exercise[]) => void;
  alreadyAddedExercises: Exercise[];
};

const ExerciseAutocomplete = ({
  selectedExercises,
  onExercisesSelectedChange,
  alreadyAddedExercises,
}: ExerciseAutocompleteProps): JSX.Element => {
  const [searchValue, setSearchValue] = useState<string>("");
  const { data: exercises, isLoading: isExercisesLoading } =
    useGetExercisesQuery({
      nameRegex: searchValue !== "" ? searchValue : undefined,
    });

  return (
    <Autocomplete
      id="related-text"
      multiple
      options={
        exercises?.filter(
          (ex) => !alreadyAddedExercises.some((al) => al._id === ex._id),
        ) ?? []
      }
      getOptionLabel={(exercise) => exercise.name}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      inputValue={searchValue}
      onInputChange={(_event, newValue) => setSearchValue(newValue)}
      value={selectedExercises}
      onChange={(_event, newValue) => onExercisesSelectedChange(newValue)}
      loading={isExercisesLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus
          id="name"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isExercisesLoading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default ExerciseAutocomplete;
