import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles(theme => ({
    padded: {
        paddingTop: theme.spacing(1),
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
}));

export function CodeHeader(p: { title: string, className?: string}) {
    const styles = useStyles();
    return <AppBar position='static' color='default' className={ p.className }>
        <Box className={ styles.padded }>
            <Typography variant='button'>{ p.title }</Typography>
        </Box>
    </AppBar>
}
