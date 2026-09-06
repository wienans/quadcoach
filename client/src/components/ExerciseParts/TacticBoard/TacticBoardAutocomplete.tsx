import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { FocusEvent, SyntheticEvent, useEffect, useState } from "react";
import { useLazyGetTacticBoardsQuery } from "../../../api/quadcoachApi/tacticBoardApi";
import { TacticBoardSummary } from "../../../api/quadcoachApi/domain/TacticBoard";

export type TacticBoardAutocompleteProps = {
  value: string | undefined;
  onChange: (
    event: SyntheticEvent<Element, Event>,
    value: TacticBoardSummary | null,
  ) => void;
  onBlur: (event: FocusEvent<HTMLDivElement> | undefined) => void;
  autoFocus?: boolean;
  publicOnly?: boolean;
};

const TacticBoardAutocomplete = ({
  value,
  onChange,
  onBlur,
  autoFocus,
  publicOnly = false,
}: TacticBoardAutocompleteProps): JSX.Element => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [
    getTacticBoards,
    { data: tacticBoards, isLoading: isTacticBoardsLoading },
  ] = useLazyGetTacticBoardsQuery();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      getTacticBoards({
        search: searchValue.trim() || undefined,
        privacy: publicOnly ? "public" : undefined,
        limit: 100,
      });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [getTacticBoards, publicOnly, searchValue]);

  return (
    <Autocomplete
      id="related-text"
      options={tacticBoards?.items ?? []}
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
        tacticBoards?.items.find(
          (obj: TacticBoardSummary) => obj._id === value,
        ) ?? null
      }
      onChange={onChange}
      onBlur={onBlur}
      loading={isTacticBoardsLoading}
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
                {isTacticBoardsLoading ? (
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

export default TacticBoardAutocomplete;
