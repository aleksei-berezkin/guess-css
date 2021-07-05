import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { spacing } from './theme';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import { Link as RouterLink } from 'react-router-dom';
import { Contacts } from './contacts';

const useStyles = makeStyles(theme => ({
    root: {
        margin: theme.spacing(spacing),
        textAlign: 'center',
    },
}));

export function Footer() {
    const classes = useStyles();

    return <Box className={ classes.root }>
        <Contacts/>
        <Link to='credits' component={ RouterLink }>Credits</Link>
    </Box>
}
