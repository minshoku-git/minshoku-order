import { Button } from '@mui/material';
import React from 'react';

type Props = {
  label: string;
  eventhandler?: () => void;
  isSubmit?: boolean;
  isDisabled?: boolean;
  fc?: string;
  bgc?: string;
  isLoading?: boolean;
};

export const Btn = (props: Props) => {
  return (
    <>
      <Button
        onClick={() => (props.eventhandler ? props.eventhandler() : {})}
        variant="contained"
        type={props.isSubmit ? 'submit' : undefined}
        disabled={props.isDisabled}
        sx={{
          color: props.fc ? props.fc : '#fff',
          background: props.bgc ? props.bgc : '#ea5315',
          width: '90%',
          maxWidth: '360px',
          height: '52px',
          borderRadius: '40px',
          fontSize: '22px',
          fontWeight: 'bold',
        }}
        loading={props.isLoading}
      >
        {props.isLoading ? '' : props.label}
      </Button>
    </>
  );
};
