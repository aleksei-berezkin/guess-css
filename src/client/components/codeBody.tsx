import makeStyles from '@material-ui/core/styles/makeStyles';
import { Region, RegionKind } from '../model/region';
import Box from '@material-ui/core/Box';
import { stream } from '../stream/stream';
import React, { ReactElement } from 'react';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { useSelector } from 'react-redux';
import { ofCurrentViewOrUndefined } from '../redux/store';
import useTheme from '@material-ui/core/styles/useTheme';
import { escapeRe, globalRe } from '../util';
import { getContrastColorValue } from './contrastColorValue';

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(1.5),
    },
    pre: {
        margin: 0,
        fontFamily: 'Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
        fontSize: 12,
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

function Line(p: {regions: Region[]}) {
    const classes = useStyles();

    return <pre className={ classes.pre }>{
        p.regions.map(
            (reg, i) => <RegionCode key={ i } region={ reg } />
        )
    }</pre>
}

const regionStylesObj: {[k in RegionKind]: CSSProperties} & {differing: CSSProperties} = {
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
    differing: {
        fontWeight: 'bold',
    },
};

const useRegionStyles = makeStyles(regionStylesObj);

function RegionCode(p: {region: Region}): ReactElement {
    const assignedVars = useSelector(ofCurrentViewOrUndefined('assignedVars'));
    const regionClasses = useRegionStyles();
    const theme = useTheme();

    if (!assignedVars) {
        return <></>;
    }

    const differingClass = p.region.differing && regionClasses.differing || '';
    const { contrastColor, colors } = assignedVars;
    const { palette: { type, getContrastText }} = theme;
    const text = p.region.text.replace(globalRe(contrastColor), getContrastColorValue(theme));

    return <>{
        [...function* toSpans(text: string): IterableIterator<ReactElement> {
            for (const color of colors) {
                const match = new RegExp(`^(.*)(${ escapeRe(color.id) })(.*)$`).exec(text);
                if (match) {
                    if (match[1]) {
                        yield* toSpans(match[1]);  
                    } 

                    yield <span
                        className={ `${ differingClass }` }
                        style={{
                            backgroundColor: color[type],
                            color: getContrastText(color[type]),
                        }}
                    >{ color[type] }</span>;

                    if (match[3]) {
                        yield* toSpans(match[3]);
                    } 

                    return;
                }
            }

            yield <span className={
                `${ regionClasses[p.region.kind] } ${ differingClass }`
            }>{ text }</span>;
        }(text)]
    }</>;
}
