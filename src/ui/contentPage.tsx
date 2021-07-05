import React, { ReactElement, ReactFragment } from 'react';
import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import { routes } from './routes';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles(theme => ({
    root: {
        textAlign: 'left',
    },
    backMargins: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    }
}));

export function ContentPage(p: {children: ReactElement | ReactFragment}) {
    const classes = useStyles();

    return <Container maxWidth='sm'>
        <Box className={ classes.root }>
            <Back/>
            {
                p.children
            }
            <Back margins/>
        </Box>
    </Container>;
}

function Back({ margins = false }) {
    const classes = useStyles();
    const className = margins ? classes.backMargins : undefined;

    return <Button to={ routes.root } component={ RouterLink }
                   size='small' fullWidth color='primary'
                   className={ className }>
        Back to puzzler</Button>;
}
