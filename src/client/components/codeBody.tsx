import makeStyles from '@material-ui/core/styles/makeStyles';
import { Region, RegionKind } from '../model/region';
import Box from '@material-ui/core/Box';
import { stream } from '../stream/stream';
import React, { ReactElement } from 'react';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { useSelector } from 'react-redux';
import { ofCurrentViewOrUndefined } from '../redux/store';
import useTheme from '@material-ui/core/styles/useTheme';
import { escapeRe, globalRe, ld } from '../util';
import { getContrastColorValue } from './contrastColorValue';
import { resolveColor } from '../redux/resolveColor';
import { Theme } from '@material-ui/core';
import { hasVars } from '../model/gen/vars';
import { spacing } from './theme';

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(spacing),
    },
    pre: {
        margin: 0,
        fontFamily: 'Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
        fontSize: 12,
        lineHeight: 1.18,
        letterSpacing: 0.0,
    },
}));

export function CodeBody(p: { lines: Region[][], noBottomPadding?: boolean }) {
    const classes = useStyles();
    const inlineStyle = p.noBottomPadding ? { paddingBottom: 0 } : undefined;

    return <Box className={ classes.root } style={ inlineStyle }>{
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

const regionStylesObj: (theme: Theme) => {
    [k in RegionKind | 'differing']: CSSProperties
} = theme => ({
    default: {
        color: ld('#505050', '#c8c8c8', theme),
    },
    text: {
        color: ld('black', 'white', theme),
        backgroundColor: ld('#ececec', '#676767', theme),
    },
    tag: {
        color: ld('#4b69c6', '#559cd6', theme),
    },
    tagBracket: {
        color: ld('#91b3e0', '#808080', theme),
    },
    attrName: {
        color: ld('#9b5d27', '#9cdcff', theme),
    },
    attrValue: {
        color: ld('#438b27', '#ce9178', theme),
    },
    operator: {
        color: ld('#777777', '#d4d4d4', theme),
    },
    selector: {
        color: ld('#793e9d', '#d7bb7d', theme),
    },
    declName: {
        color: ld('#9b5d27', '#9cdcff', theme),
    },
    declValue: {
        color: ld('black', 'white', theme),
    },
    comment: {
        color: ld('#438b27', '#6a9954', theme),
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
    if (!hasVars(p.region.text)) {
        return <span className={
            `${ regionClasses[p.region.kind] } ${ differingClass }`
        }>{ p.region.text }</span>;
    }

    const { contrastColor, colors } = vars;
    const { palette: { type, getContrastText }} = theme;
    const text = p.region.text.replace(globalRe(contrastColor), getContrastColorValue(theme));

    return <>{
        [...function* toSpans(text: string, key: string): IterableIterator<ReactElement> {
            for (const assignedCol of colors) {
                const match = new RegExp(`^(.*)(${ escapeRe(assignedCol.id) })(.*)$`).exec(text);
                if (match) {
                    if (match[1]) {
                        yield* toSpans(match[1], key + 'a');  
                    } 

                    const resolvedCol = resolveColor(assignedCol, type);
                    yield <span
                        key={ key + 'b'}
                        className={ `${ differingClass }` }
                        style={{
                            backgroundColor: resolvedCol,
                            color: getContrastText(resolvedCol),
                        }}
                    >{ resolvedCol }</span>;

                    if (match[3]) {
                        yield* toSpans(match[3], key + 'c');
                    } 

                    return;
                }
            }

            yield <span key={ key } className={
                `${ regionClasses[p.region.kind] } ${ differingClass }`
            }>{ text }</span>;
        }(text, '')]
    }</>;
}
