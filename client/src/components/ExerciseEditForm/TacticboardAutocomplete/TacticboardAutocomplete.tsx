import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useState } from "react";
import { TacticBoard } from "../../../api/quadcoachApi/domain";
import { useGetTacticBoardsQuery } from "../../../pages/tacticboardApi";

export type TacticboardAutocompleteProps = {
  value: TacticBoard | undefined;
  onChange: () => void;
  onBlur: () => void;
};

const TacticboardAutocomplete = ({
  value,
  onChange,
  onBlur,
}: TacticboardAutocompleteProps): JSX.Element => {
  const [searchValue, setSearchValue] = useState<string>("");
  const { data: tacticboards, isLoading: isTacticboardsLoading } =
    useGetTacticBoardsQuery({
      nameRegex: searchValue !== "" ? searchValue : undefined,
    });

  return (
    <Autocomplete
      id="related-text"
      options={tacticboards ?? []}
      getOptionLabel={(option) => option.name ?? ""}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      inputValue={searchValue}
      onInputChange={(_event, newValue) => setSearchValue(newValue)}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      loading={isTacticboardsLoading}
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
                {isTacticboardsLoading ? (
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

export default TacticboardAutocomplete;
