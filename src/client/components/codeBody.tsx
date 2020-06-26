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
import { resolveColor } from '../redux/resolveColor';
import { Theme } from '@material-ui/core';

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

function ld(light: string, dark: string, theme: Theme) {
    return theme.palette.type === 'light' ? light : dark;
}

const regionStylesObj: (theme: Theme) => {
    [k in RegionKind | 'differing']: CSSProperties
} = theme => ({
    default: {
        color: ld('black', 'white', theme),
    },
    text: {
        color: ld('black', 'white', theme),
        backgroundColor: ld('#f2f2f2', '#6c6c6c', theme),
    },
    tag: {
        color: ld('#800000', '#559cd6', theme),
    },
    tagBracket: {
        color: ld('#808080', '#808080', theme),
    },
    attrName: {
        color: ld('#0000ff', '#9cdcff', theme),
    },
    attrValue: {
        color: ld('#1301ff', '#ce9178', theme),
    },
    operator: {
        color: ld('#4a4a4a', '#d4d4d4', theme),
    },
    selector: {
        color: ld('#800000', '#d7bb7d', theme),
    },
    declName: {
        color: ld('#ff0102', '#9cdcff', theme),
    },
    declValue: {
        color: ld('black', 'white', theme),
    },
    comment: {
        color: ld('#008002', '#6a9954', theme),
        fontStyle: 'italic',
    },
    differing: {
        fontWeight: 'bold',
    },
});

const useRegionStyles = makeStyles(regionStylesObj);

function RegionCode(p: {region: Region}): ReactElement {
    const vars = useSelector(ofCurrentViewOrUndefined('vars'));
    const regionClasses = useRegionStyles();
    const theme = useTheme();

    if (!vars) {
        return <></>;
    }

    const differingClass = p.region.differing && regionClasses.differing || '';
    const { contrastColor, colors } = vars;
    const { palette: { type, getContrastText }} = theme;
    const text = p.region.text.replace(globalRe(contrastColor), getContrastColorValue(theme));

    return <>{
        [...function* toSpans(text: string): IterableIterator<ReactElement> {
            for (const assignedCol of colors) {
                const match = new RegExp(`^(.*)(${ escapeRe(assignedCol.id) })(.*)$`).exec(text);
                if (match) {
                    if (match[1]) {
                        yield* toSpans(match[1]);  
                    } 

                    const resolvedCol = resolveColor(assignedCol, type);
                    yield <span
                        className={ `${ differingClass }` }
                        style={{
                            backgroundColor: resolvedCol,
                            color: getContrastText(resolvedCol),
                        }}
                    >{ resolvedCol }</span>;

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
