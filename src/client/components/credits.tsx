import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import deps from '../../../generated/deps.json';
import Accordion, { AccordionProps } from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Link as RouterLink } from 'react-router-dom';
import { monospaceFonts } from '../util';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { routes } from '../routes';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles(theme => ({
    root: {
        textAlign: 'left',
    },
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
    backMargins: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    }
}));

export function Credits() {
    const classes = useStyles();
    const [visible, setVisible] = useState<{[k: string]: boolean}>({});

    return <Box className={ classes.root }>
        <Back/>
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
            deps.map(dep => {
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
                        <Typography variant='body2'><Link target='_blank' href={ dep.homepage }>{ dep.homepage }</Link></Typography>
                        <License name={ dep.name } visible={ visible[dep.name] }/>
                    </AccordionDetails>
                </Accordion>;
            })
        }

        <Back margins/>
    </Box>
}

function Back({ margins = false }) {
    const classes = useStyles();
    const className = margins ? classes.backMargins : undefined;

    return <Button to={ routes.root } component={ RouterLink }
                   size='small' fullWidth color='primary'
                   className={ className }>
        Back to puzzler</Button>;
}

function License(p: {name: string, visible: boolean | undefined}) {
    const classes = useStyles();
    const [licenseText, setLicenseText] = useState('');
    useEffect(() => {
        if (p.visible && !licenseText) {
            fetch(`/licenses?name=${ p.name }`)
                .then(res => res.text())
                .then(setLicenseText);
        }
    }, [p.visible]);

    if (!licenseText) {
        return <Grid container justify='center'>
            <Grid item>
                <CircularProgress color='inherit'/>
            </Grid>
        </Grid>
    }

    return <Typography component='pre' className={ classes.licenseText }>
        { licenseText }
    </Typography>
}
