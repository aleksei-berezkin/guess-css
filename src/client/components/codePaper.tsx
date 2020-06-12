import React, { ReactElement } from 'react';
import { Region } from '../model/region';
import { stream } from '../stream/stream';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

type StylesProps = {
    withChildren: boolean,
    
}

const useStyles = makeStyles(theme => ({
    outer: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
        paddingBottom: (p: StylesProps) => p.withChildren ? theme.spacing(1) : 0,
    },
    codeHeader: {
        backgroundColor: theme.palette.grey![200],
        paddingLeft: theme.spacing(1),
    },
    codeBody: {
        padding: theme.spacing(1),
        paddingTop: theme.spacing(.5),
    },
}));

export function CodePaper(p: { title: string, lines: Region[][], children?: ReactElement }) {
    const classes = useStyles({ withChildren: !!p.children });

    return <Paper className={ classes.outer }>
        <Box className={ classes.codeHeader } ><Typography variant='subtitle1'>{ p.title }</Typography></Box>
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
