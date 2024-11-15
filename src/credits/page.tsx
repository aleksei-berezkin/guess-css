'use client'

import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Accordion, { AccordionProps } from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { monospaceFonts } from '../monospaceFonts';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import CircularProgress from '@mui/material/CircularProgress';
import { ContentPage } from '../contentPage';
import { routes } from '../routes';
import { gaPageview } from '../ga';
import { Grid2 } from '@mui/material';


export default function CreditsPage() {
    const [visible, setVisible] = useState<{[k: string]: boolean}>({});

    useEffect(() => gaPageview(routes.credits), []);

    const [deps, setDeps] = useState<Awaited<typeof import('../../generated/deps.json')> | undefined>();

    useEffect(() => {
        (async () => {
            setDeps((await import('../../generated/deps.json')).default)
        })()
     }, [])

    return <ContentPage>
        <Typography variant='h4'>Credits</Typography>
        <Typography variant='h5'>Assets</Typography>
        <List dense>
            <ListItem>
                <Typography variant='body2'>
                    Font: <Link target='_blank' href='https://fonts.google.com/specimen/Roboto'>Roboto</Link>
                </Typography>
            </ListItem>
            <ListItem>
                <Typography variant='body2'>
                    Code color themes: <Link target='_blank' href='https://code.visualstudio.com/'>VS Code</Link>
                </Typography>
            </ListItem>
            <ListItem>
                <Typography variant='body2'>
                    Favicon made by <Link target='_blank' href='https://www.flaticon.com/authors/pixel-perfect' title='Pixel perfect'>Pixel perfect</Link> from <Link target='_blank' href='https://flaticon.com/' title="Flaticon">Flaticon</Link>
                </Typography>
            </ListItem>
        </List>

        <Typography variant='h5'>Dependencies</Typography>
        {
            deps
                ? deps.map(dep => {
                    const onChange: AccordionProps['onChange'] = (_e, expanded) => {
                        setVisible({
                            ...visible,
                            [dep.name]: expanded,
                        })
                    };
    
                    return <Accordion key={ dep.name } onChange={ onChange }>
                        <AccordionSummary
                            expandIcon={ <ExpandMoreIcon/> }>
                            <Typography variant='body2'>{ dep.name }</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{
                            '& > *:not(:last-child)': { mb: 1 },
                        }}>
                            <Typography variant='body2'>{ dep.description }</Typography>
                            <Typography variant='body2'><Link target='_blank' href={ dep.link }>{ dep.link }</Link></Typography>
                            {
                                visible[dep.name] && <License name={ dep.name }/>
                            }
                        </AccordionDetails>
                    </Accordion>;
                })
                : <CenteredSpinner/>
        }
    </ContentPage>
}

function License(p: {name: string}) {
    const [licenseText, setLicenseText] = useState('');

    useEffect(() => {
        (async () => {
            const licenses: {[l: string]: string} = (await import('../../generated/licenses.json')).default
            setLicenseText(licenses[p.name])
        })()
    }, [p.name])

    if (!licenseText) {
        return <CenteredSpinner/>
    }

    return <Typography component='pre' sx={{
        overflow: 'scroll',
        maxHeight: 240,
        fontFamily: monospaceFonts,
        fontSize: 12,
    }}>
        { licenseText }
    </Typography>
}


function CenteredSpinner() {
    return <Grid2 container sx={{justify: 'center'}}>
        <div>
            <CircularProgress color='inherit'/>
        </div>
    </Grid2>
}
