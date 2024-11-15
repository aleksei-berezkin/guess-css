import { ReactElement, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { routes } from './routes';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import { Footer } from './footer';

export function ContentPage(p: {noButtons?: boolean, footer?: boolean, children: ReactElement | Iterable<ReactNode>}) {
    return <Container maxWidth='sm'>
        <Box sx={{
            mb: p.noButtons ? undefined : 2,
            mt: p.noButtons ? undefined : 2,
            textAlign: 'left',
        }}>
            { !p.noButtons && <Back/> }
            {
                p.children
            }
            { !p.noButtons && <Back/> }
        </Box>
        { p.footer && <Footer/> }
    </Container>;
}

function Back() {
    return <Button to={ routes.root } component={ RouterLink }
                   size='small' fullWidth color='primary'
                   sx={{mt: 1, mb: 1}}>Back to puzzler</Button>;
}
