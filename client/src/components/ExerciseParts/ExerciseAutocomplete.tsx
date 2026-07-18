import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useState } from "react";
import { useGetExercisesQuery } from "../../pages/exerciseApi";
import { ExerciseReference } from "../../api/quadcoachApi/domain";

export type ExerciseAutocompleteProps = {
  selectedExercises: ExerciseReference[];
  onExercisesSelectedChange: (selectedExercises: ExerciseReference[]) => void;
  alreadyAddedExercises: ExerciseReference[];
};

const ExerciseAutocomplete = ({
  selectedExercises,
  onExercisesSelectedChange,
  alreadyAddedExercises,
}: ExerciseAutocompleteProps): JSX.Element => {
  const [searchValue, setSearchValue] = useState<string>("");
  const { data: exercises, isLoading: isExercisesLoading } =
    useGetExercisesQuery({
      search: searchValue !== "" ? searchValue : undefined,
    });

  return (
    <Autocomplete
      id="related-text"
      multiple
      options={
        exercises?.items.filter(
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
