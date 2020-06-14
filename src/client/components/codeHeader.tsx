import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';

const useStyles = makeStyles(theme => ({
    padded: {
        paddingTop: theme.spacing(1),
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    userCorrect: {
        backgroundColor: green['A100'],
    },
    correct: {
        backgroundColor: green[100],
    },
    incorrect: {
        backgroundColor: red [100] ,
    },
}));

export function CodeHeader(p: { title: string, color?: 'userCorrect' | 'correct' | 'incorrect'}) {
    const styles = useStyles();
    return <AppBar position='static' color='default' className={ p.color && styles[p.color] || undefined }>
        <Box className={ styles.padded }>
            <Typography variant='button'>{ p.title }</Typography>
        </Box>
    </AppBar>
}
