import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { FocusEvent, SyntheticEvent, useEffect, useState } from "react";
import { useLazyGetTacticBoardHeadersQuery } from "../../../api/quadcoachApi/tacticBoardApi";
import { TacticBoardHeader } from "../../../api/quadcoachApi/domain/TacticBoard";

export type TacticBoardAutocompleteProps = {
  value: string | undefined;
  onChange: (
    event: SyntheticEvent<Element, Event>,
    value: TacticBoardHeader | null,
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
  ] = useLazyGetTacticBoardHeadersQuery();

  useEffect(() => {
    getTacticBoards(publicOnly ? { isPrivate: false } : {});
  }, [getTacticBoards, publicOnly]);

  return (
    <Autocomplete
      id="related-text"
      options={(tacticBoards?.tacticBoards ?? []).filter(
        (option) => !publicOnly || !option.isPrivate,
      )}
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
        tacticBoards?.tacticBoards.find(
          (obj: TacticBoardHeader) => obj["_id"] === value,
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
