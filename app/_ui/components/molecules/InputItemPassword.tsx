import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, IconButton, InputAdornment, InputLabel, TextField, Typography } from '@mui/material';
import React, { SetStateAction } from 'react';
import { TextFieldElement } from 'react-hook-form-mui';

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  label: string;
  annotation?: string;
  name: string;
  setShowPassword: (value: SetStateAction<boolean>) => void
  showPassword: boolean;
};

export const InputItemPassword = (props: Props) => {
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
        <Typography sx={{ fontWeight: 'bold', fontSize: 16, color: '#ea5315' }}>必須</Typography>
      </Box>
      <TextFieldElement
        name={props.name}
        type={props.showPassword ? 'text' : 'password'}
        fullWidth
        required
        control={props.control}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => props.setShowPassword((prev) => !prev)}
                  edge="end"
                >
                  {props.showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }
        }}
      />
    </Box>
  );
};
