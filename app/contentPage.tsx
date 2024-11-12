import React, { ReactElement, ReactFragment } from 'react';
import Box from '@mui/material-pigment-css/Box';
import Button from '@mui/material/Button';
import { routes } from './routes';
import RouterLink from 'next/link';
import Container from '@mui/material-pigment-css/Container';
import { Footer } from './footer';
import { css, styled } from '@mui/material-pigment-css';

export const ContentPage = styled(ContentPageImpl)(({ theme }) => ({
    [`& > ${Box}`]: {
        textAlign: 'center',
        variants: [
            {
                props: (p: ContentPageProps) => !!p.noButtons,
                marginBottom: theme.spacing(2),
                marginTop: theme.spacing(2),
            },
            {
                props: (p: ContentPageProps) => !p.noButtons,
            },
        ]
    }
}))

type ContentPageProps = Parameters<typeof ContentPageImpl>[0]

function ContentPageImpl(p: {
    noButtons?: boolean,
    footer?: boolean,
    children: ReactElement | ReactFragment
}) {
    return <Container maxWidth='sm'>
        <Box>
            { !p.noButtons && <Back/> }
            {
                p.children
            }
            { !p.noButtons && <Back margins/> }
        </Box>
        { p.footer && <Footer/> }
    </Container>;
}

const backMarginsClass = css(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}))

function Back({ margins = false }) {
    const className = margins ? backMarginsClass : undefined;

    return <Button href={ routes.root } component={ RouterLink }
                   size='small' fullWidth color='primary'
                   className={ className }>
        Back to puzzler</Button>;
}
