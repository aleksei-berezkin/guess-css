import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';

export function CodeHeader(p: { title: string, className?: string}) {
    return <AppBar position='static' color='default' className={ p.className }>
        <Box sx={{ pt: 1, pl: 3, pr: 1, pb: 1 }}>
            <Typography variant='button'>{ p.title }</Typography>
        </Box>
    </AppBar>
}
