import { Box, InputLabel, Typography } from '@mui/material';
import React from 'react';
import { SelectElement, TextFieldElement } from 'react-hook-form-mui';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  label: string;
  annotation?: string;
  name: string;
  required?: boolean;
  type?: string;
  disabled?: boolean;
  note?: string;
  options: { id: string; label: string }[];
};

export const SelectItem = (props: Props) => {
  return (
    <Box display="div" sx={{ pb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <InputLabel sx={{ fontWeight: 'bold', color: '#252525', fontSize: 16 }} htmlFor={props.name}>
            {props.label}
          </InputLabel>
          {props.annotation && (
            <InputLabel sx={{ fontWeight: 'bold', color: '#252525', fontSize: 16 }} htmlFor={props.name}>
              {props.annotation}
            </InputLabel>
          )}
        </Box>
        {props.required && <Typography sx={{ fontWeight: 'bold', fontSize: 16, color: '#ea5315' }}>必須</Typography>}
      </Box>
      <SelectElement
        name={props.name}
        control={props.control}
        variant="outlined"
        margin="normal"
        sx={{ mt: 0 }}
        fullWidth
        required={props.required}
        disabled={props.disabled}
        options={props.options}
      />
      <Typography sx={{ fontSize: 12, color: '#252525' }}>{props.note}</Typography>
    </Box>
  );
};
