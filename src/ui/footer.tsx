import React from 'react';
import { spacing } from './theme';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';
import { Contacts } from './contacts';

export function Footer() {
    return <Box sx={{ margin: spacing, textAlign: 'center' }}>
        <Contacts/>
        <Link to='credits' component={ RouterLink }>Credits</Link>
    </Box>
}
