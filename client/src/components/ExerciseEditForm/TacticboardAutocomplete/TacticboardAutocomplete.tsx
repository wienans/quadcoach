import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { FocusEvent, SyntheticEvent, useState } from "react";
import { TacticBoard } from "../../../api/quadcoachApi/domain";
import { useGetTacticBoardsQuery } from "../../../api/quadcoachApi/tacticboardApi";

export type TacticboardAutocompleteProps = {
  value: string | undefined;
  onChange: (
    event: SyntheticEvent<Element, Event>,
    value: TacticBoard | null,
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
  const { data: tacticboards, isLoading: isTacticboardsLoading } =
    useGetTacticBoardsQuery({
      nameRegex: searchValue !== "" ? searchValue : undefined,
    });

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
      onInputChange={(_event, newValue) => setSearchValue(newValue)}
      value={
        tacticboards?.find((obj: TacticBoard) => obj["_id"] === value) ?? null
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
