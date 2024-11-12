import React from 'react';
import { spacing } from './theme';
import Link from '@mui/material/Link';
import Box from '@mui/material-pigment-css/Box';
import RouterLink from 'next/link';
import { Contacts } from './contacts';

export function Footer() {
    return <Box sx={{ margin: spacing, textAlign: 'center' }}>
        <Contacts/>
        
        <Link href='credits' component={ RouterLink } sx={{ fontSize: '.9em'}}>Credits</Link>
    </Box>
}
