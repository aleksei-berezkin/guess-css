import { spacing } from './theme';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import { Link as RouterLink } from 'wouter';
import { Contacts } from './contacts';
import { routes } from './routes';

export function Footer() {
    return <Box sx={{ margin: spacing, textAlign: 'center' }}>
        <Contacts/>
        <Link to= { routes.credits } component={ RouterLink } sx={{ fontSize: '.9em'}}>Credits</Link>
    </Box>
}
