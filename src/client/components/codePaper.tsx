import React, { ReactElement } from 'react';
import { Region } from '../model/region';
import { stream } from '../stream/stream';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';

type StylesProps = {
    withChildren: boolean,
    
}

const useStyles = makeStyles(theme => ({
    outer: {
        marginTop: theme.spacing(1.5),
        marginRight: theme.spacing(1.5),
        paddingBottom: (p: StylesProps) => p.withChildren ? theme.spacing(1) : 0,
    },
    codeHeader: {
        paddingTop: theme.spacing(1),
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    codeBody: {
        padding: theme.spacing(1.5),
    },
}));

export function CodePaper(
    p: {
        title: string,
        lines: Region[][],
        headerClass?: string,
        children?: ReactElement
    }
) {
    const classes = useStyles({ withChildren: !!p.children });

    return <Paper className={ classes.outer }>
        <AppBar position='static' color='default' className={ p.headerClass }>
            <Box className={ classes.codeHeader }>
                <Typography variant='button'>{ p.title }</Typography>
            </Box>
        </AppBar>
        <Box className={ `code ${classes.codeBody }` }><Lines lines={ p.lines }/></Box>
        { p.children }
    </Paper>;
}

export function Lines(p: {lines: Region[][] | undefined}) {
    return <>{
        p.lines &&
        stream(p.lines).zipWithIndex().map(
            ([regions, i]) => <Line key={ i } regions={ regions }/>
        )
    }</>;
}

export function Line(p: {regions: Region[]}) {
    return <pre>{
        p.regions.map(
            (reg, i) => {
                const className = reg.differing
                    ? reg.kind + ' differing'
                    : reg.kind;

                return <span key={ i } className={ className } style={ getStyle(reg) }>{ reg.text }</span>;
            }
        )
    }</pre>
}

function getStyle(reg: Region) {
    if (reg.backgroundColor) {
        if (reg.color) {
            return {
                backgroundColor: reg.backgroundColor,
                color: reg.color,
            }
        }
        return {
            backgroundColor: reg.backgroundColor,
        }
    }
    return undefined;
}
