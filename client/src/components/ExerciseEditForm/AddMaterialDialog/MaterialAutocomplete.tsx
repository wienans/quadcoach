import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useLazyGetAllMaterialsQuery } from "../../../pages/exerciseApi";

export type MaterialAutocompleteProps = {
  selectedMaterials: string[];
  onMaterialSelectedChange: (selectedMaterials: string[]) => void;
  alreadyAddedMaterials: string[];
};

const MaterialAutocomplete = ({
  selectedMaterials,
  onMaterialSelectedChange,
  alreadyAddedMaterials,
}: MaterialAutocompleteProps): JSX.Element => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [getMaterials, { data: materials, isLoading: isMaterialsLoading }] =
    useLazyGetAllMaterialsQuery();

  useEffect(() => {
    // Load initial data
    getMaterials(undefined);
  }, [getMaterials]);

  const filteredOptions = [
    ...(materials?.filter(
      (material) => !alreadyAddedMaterials.some((rel) => rel === material),
    ) ?? []),
    ...(searchValue && !materials?.includes(searchValue) ? [searchValue] : []),
  ];

  return (
    <Autocomplete
      id="related-text"
      freeSolo
      multiple
      options={filteredOptions}
      getOptionLabel={(material) => material}
      isOptionEqualToValue={(option, value) => option === value}
      inputValue={searchValue}
      onInputChange={(_event, newValue) => setSearchValue(newValue)}
      value={selectedMaterials}
      onChange={(_event, newValue) => onMaterialSelectedChange(newValue)}
      loading={isMaterialsLoading}
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
                {isMaterialsLoading ? (
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

export default MaterialAutocomplete;
