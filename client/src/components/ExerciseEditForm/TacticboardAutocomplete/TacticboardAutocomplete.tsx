import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { FocusEvent, SyntheticEvent, useEffect, useState } from "react";
import { useLazyGetTacticBoardHeadersQuery } from "../../../api/quadcoachApi/tacticboardApi";
import { TacticBoardHeader } from "../../../api/quadcoachApi/domain/TacticBoard";

export type TacticboardAutocompleteProps = {
  value: string | undefined;
  onChange: (
    event: SyntheticEvent<Element, Event>,
    value: TacticBoardHeader | null,
  ) => void;
  onBlur: (event: FocusEvent<HTMLDivElement> | undefined) => void;
  autoFocus?: boolean;
};

const TacticboardAutocomplete = ({
  value,
  onChange,
  onBlur,
  autoFocus,
}: TacticboardAutocompleteProps): JSX.Element => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [
    getTacticboards,
    { data: tacticboards, isLoading: isTacticboardsLoading },
  ] = useLazyGetTacticBoardHeadersQuery();

  useEffect(() => {
    // Load initial data
    getTacticboards({});
  }, [getTacticboards]);

  return (
    <Autocomplete
      id="related-text"
      options={tacticboards ?? []}
      getOptionLabel={(option) => option.name ?? ""}
      isOptionEqualToValue={(option, value) => {
        if (value != null && value != undefined) {
          return option._id === value._id;
        } else {
          return false;
        }
      }}
      inputValue={searchValue}
      onInputChange={(_event, newValue) => {
        setSearchValue(newValue);
      }}
      value={
        tacticboards?.find((obj: TacticBoardHeader) => obj["_id"] === value) ??
        null
      }
      onChange={onChange}
      onBlur={onBlur}
      loading={isTacticboardsLoading}
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus={autoFocus}
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
