import React, { ReactElement, ReactFragment } from 'react';
import Box from '@mui/material/Box';
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import { routes } from './routes';
import RouterLink from 'next/link';
import Container from '@mui/material/Container';
import { Footer } from './footer';

const useStyles = makeStyles(theme => ({
    root: (p: {margins?: boolean}) => ({
        marginBottom: p.margins ? theme.spacing(2) : undefined,
        marginTop: p.margins ? theme.spacing(2) : undefined,
        textAlign: 'left',
    }),
    backMargins: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}));

export function ContentPage(p: {noButtons?: boolean, footer?: boolean, children: ReactElement | ReactFragment}) {
    const classes = useStyles({margins: !!p.noButtons});

    return <Container maxWidth='sm'>
        <Box className={ classes.root }>
            { !p.noButtons && <Back/> }
            {
                p.children
            }
            { !p.noButtons && <Back margins/> }
        </Box>
        { p.footer && <Footer/> }
    </Container>;
}

function Back({ margins = false }) {
    const classes = useStyles({});
    const className = margins ? classes.backMargins : undefined;

    return <Button href={ routes.root } component={ RouterLink }
                   size='small' fullWidth color='primary'
                   className={ className }>
        Back to puzzler</Button>;
}
