import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Accordion, { AccordionProps } from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { monospaceFonts } from '../monospaceFonts';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import { ContentPage } from './contentPage';
import { routes } from './routes';
import { gaPageview } from './ga';

const useStyles = makeStyles(theme => ({
    accDetails: {
        display: 'block',
        overflow: 'hidden',
        '&>*': {
            marginBottom: theme.spacing(1),
        },
        '& *:last-child': {
            marginBottom: 0,
        },
    },
    licenseText: {
        overflow: 'scroll',
        maxHeight: 240,
        fontFamily: monospaceFonts,
        fontSize: 12,
    },
}));

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

export function Credits() {
    const classes = useStyles();
    const [visible, setVisible] = useState<{[k: string]: boolean}>({});

    useEffect(() => gaPageview(routes.credits), []);

    const depsPromise = import('../../generated/deps.json').then(res => res.default);
    const [deps, setDeps] = useState<Awaited<typeof depsPromise> | undefined>();
    useEffect(() => void depsPromise.then(d => setDeps(d)), []);

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
                    const onChange: AccordionProps['onChange'] = (e, expanded) => {
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
                        <AccordionDetails className={ classes.accDetails }>
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
    const classes = useStyles();
    const licensesPromise = import('../../generated/licenses.json').then(res => res.default as {[k: string]: string});
    const [licenseText, setLicenseText] = useState('');
    useEffect(() => void licensesPromise.then(l => setLicenseText(l[p.name])), []);

    if (!licenseText) {
        return <CenteredSpinner/>
    }

    return <Typography component='pre' className={ classes.licenseText }>
        { licenseText }
    </Typography>
}


function CenteredSpinner() {
    return <Grid container justify='center'>
        <Grid item>
            <CircularProgress color='inherit'/>
        </Grid>
    </Grid>
}
