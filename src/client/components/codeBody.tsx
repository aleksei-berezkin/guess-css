import makeStyles from '@material-ui/core/styles/makeStyles';
import { Region, RegionKind } from '../model/region';
import Box from '@material-ui/core/Box';
import { stream } from '../stream/stream';
import React from 'react';

const useStyles = makeStyles(theme => ({
    outer: {
        padding: theme.spacing(1.5),
    },
    pre: {
        margin: 0,
        fontFamily: 'Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
        fontSize: 12,
    },
    [RegionKind.Default]: {
        color: '#000000',
    },
    [RegionKind.Text]: {
        color: '#000000',
        backgroundColor: '#f2f2f2',
    },
    [RegionKind.Tag]: {
        color: '#0000c0',
    },
    [RegionKind.AttrName]: {
        color: '#0000ff',
    },
    [RegionKind.AttrValue]: {
        color: '#008000',
    },
    [RegionKind.Operator]: {
        color: '#008000',
    },
    [RegionKind.Selector]: {
        color: '#000080',
    },
    [RegionKind.DeclName]: {
        color: '#000000',
    },
    [RegionKind.DeclValue]: {
        color: '#000000',
    },
    [RegionKind.Comment]: {
        color: '#808080',
        fontStyle: 'italic',
    },
    differing: {
        fontWeight: 'bold',
    },
}));

export function CodeBody(p: { lines: Region[][] }) {
    const classes = useStyles();

    return <Box className={ `code ${ classes.outer }` }>{
        p.lines &&
        stream(p.lines).zipWithIndex().map(
            ([regions, i]) => <Line key={ i } regions={ regions }/>
        )
    }</Box>;
}

function Line(p: {regions: Region[]}) {
    const classes = useStyles();

    return <pre className={ classes.pre }>{
        p.regions.map(
            (reg, i) => {
                return <span
                    key={ i }
                    className={ `${ classes[reg.kind] } ${ reg.differing && classes.differing || '' }` }
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
