import { Box, CircularProgress, Typography } from '@mui/material';
import React from 'react';

export const LoadingSpinner = () => {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress color="warning" size="4rem" />
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography
                        variant="caption"
                        component="div"
                        sx={{ color: '#ea5315' }}
                    >Loading</Typography>
                </Box>
            </Box>
        </Box>
    );
};
