import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { useLazyGetAllTagsQuery } from "../../../pages/exerciseApi";
import debounce from "lodash/debounce";

export type TagAutocompleteProps = {
  selectedTags: string[];
  onTagSelectedChange: (selectedTags: string[]) => void;
  alreadyAddedTags: string[];
};

const TagAutocomplete = ({
  selectedTags,
  onTagSelectedChange,
  alreadyAddedTags,
}: TagAutocompleteProps): JSX.Element => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [getTags, { data: tags, isLoading: isTagsLoading }] =
    useLazyGetAllTagsQuery();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedGetTags = useCallback(
    debounce((search: string) => {
      getTags(search || undefined);
    }, 300),
    [getTags],
  );

  useEffect(() => {
    debouncedGetTags(searchValue);
    // Cleanup
    return () => {
      debouncedGetTags.cancel();
    };
  }, [searchValue, debouncedGetTags]);

  const filteredOptions = [
    ...(tags?.filter((tag) => !alreadyAddedTags.some((rel) => rel === tag)) ??
      []),
    ...(searchValue && !tags?.includes(searchValue) ? [searchValue] : []),
  ];

  return (
    <Autocomplete
      id="related-text"
      freeSolo
      multiple
      options={filteredOptions}
      getOptionLabel={(tag) => tag}
      isOptionEqualToValue={(option, value) => option === value}
      inputValue={searchValue}
      onInputChange={(_event, newValue) => setSearchValue(newValue)}
      value={selectedTags}
      onChange={(_event, newValue) => onTagSelectedChange(newValue)}
      loading={isTagsLoading}
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
                {isTagsLoading ? (
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

export default TagAutocomplete;
