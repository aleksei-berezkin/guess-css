import React, { ReactElement, ReactFragment } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { routes } from './routes';
import RouterLink from 'next/link';
import Container from '@mui/material/Container';
import { Footer } from './footer';

export function ContentPage(p: {noButtons?: boolean, footer?: boolean, children: ReactElement | ReactFragment}) {
    return <Container maxWidth='sm'>
        <Box
            sx={{
                textAlign: 'left',
                '&.with-margins': {
                    mb: 2, mt: 2
                }
            }}
            className={ p.noButtons ? 'with-margins' : '' }
        >
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
    return <Button
                href={ routes.root }
                component={ RouterLink }
                size='small' fullWidth color='primary'
                sx={{'&.with-margins': { mt: 1, mb: 1 }}}
                className={ margins ? 'with-margins' : '' }>Back to puzzler</Button>;
}
