import makeStyles from '@material-ui/core/styles/makeStyles';
import { Region, RegionKind } from '../model/region';
import Box from '@material-ui/core/Box';
import { stream } from '../stream/stream';
import React from 'react';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(1.5),
    },
    pre: {
        margin: 0,
        fontFamily: 'Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
        fontSize: 12,
    },
    differing: {
        fontWeight: 'bold',
    },
}));

export function CodeBody(p: { lines: Region[][] }) {
    const classes = useStyles();

    return <Box className={ `code ${ classes.root }` }>{
        p.lines &&
        stream(p.lines).zipWithIndex().map(
            ([regions, i]) => <Line key={ i } regions={ regions }/>
        )
    }</Box>;
}

const regionStylesObj: {[k in RegionKind]: CSSProperties} = {
    default: {
        color: '#000000',
    },
    text: {
        color: '#000000',
        backgroundColor: '#f2f2f2',
    },
    tag: {
        color: '#0000c0',
    },
    attrName: {
        color: '#0000ff',
    },
    attrValue: {
        color: '#008000',
    },
    operator: {
        color: '#008000',
    },
    selector: {
        color: '#000080',
    },
    declName: {
        color: '#000000',
    },
    declValue: {
        color: '#000000',
    },
    comment: {
        color: '#808080',
        fontStyle: 'italic',
    },
};

const useRegionStyles = makeStyles(regionStylesObj);

function Line(p: {regions: Region[]}) {
    const classes = useStyles();
    const regionClasses = useRegionStyles();

    return <pre className={ classes.pre }>{
        p.regions.map(
            (reg, i) => {
                return <span
                    key={ i }
                    className={ `${ regionClasses[reg.kind] } ${ reg.differing && classes.differing || '' }` }
                    style={ getInlineColorStyle(reg) }
                >{
                    reg.text
                }</span>;
            }
        )
    }</pre>
}

function getInlineColorStyle(reg: Region) {
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
