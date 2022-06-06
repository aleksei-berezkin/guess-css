import makeStyles from '@material-ui/core/styles/makeStyles';
import { Region, regionKind, RegionKindLabel } from '../model/region';
import Box from '@material-ui/core/Box';
import React, { ReactElement } from 'react';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { ofCurrentViewOrUndefined, useSelector } from '../store/store';
import useTheme from '@material-ui/core/styles/useTheme';
import { monospaceFonts } from '../monospaceFonts';
import { getContrastColorValue } from './contrastColorValue';
import { resolveColor } from './resolveColor';
import { Theme } from '@material-ui/core';
import { hasVars } from '../model/gen/vars';
import { spacing } from './theme';
import { escapeRe, globalEscapedRe } from './escapeRe';

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(spacing),
    },
    pre: {
        margin: 0,
        fontFamily: monospaceFonts,
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
        p.lines.map(
            (regions, i) => <Line key={ i } regions={ regions }/>
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
    [k in RegionKindLabel | 'differing']: CSSProperties
} = theme => ({
    [regionKind.default]: {
        color: ld('#505050', '#c8c8c8', theme),
    },
    [regionKind.text]: {
        color: ld('black', 'white', theme),
        backgroundColor: ld('#ececec', '#676767', theme),
    },
    [regionKind.tag]: {
        color: ld('#4b69c6', '#559cd6', theme),
    },
    [regionKind.tagBracket]: {
        color: ld('#91b3e0', '#808080', theme),
    },
    [regionKind.attrName]: {
        color: ld('#9b5d27', '#9cdcff', theme),
    },
    [regionKind.attrValue]: {
        color: ld('#438b27', '#ce9178', theme),
    },
    [regionKind.operator]: {
        color: ld('#777777', '#d4d4d4', theme),
    },
    [regionKind.selector]: {
        color: ld('#793e9d', '#d7bb7d', theme),
    },
    [regionKind.declarationName]: {
        color: ld('#9b5d27', '#9cdcff', theme),
    },
    [regionKind.declarationValue]: {
        color: ld('black', 'white', theme),
    },
    [regionKind.comment]: {
        color: ld('#438b27', '#6a9954', theme),
        fontStyle: 'italic',
    },
    differing: {
        fontWeight: 'bold',
    },
});

function ld(light: string, dark: string, theme: Theme) {
    return theme.palette.type === 'light' ? light : dark;
}


const useRegionStyles = makeStyles(regionStylesObj);

function RegionCode(p: {region: Region}): ReactElement {
    const [regionText, regionKind, differing] = p.region;
    const vars = useSelector(ofCurrentViewOrUndefined('vars'));
    const regionClasses = useRegionStyles();
    const theme = useTheme();

    if (!vars) {
        return <></>;
    }

    const differingClass = differing && regionClasses.differing || '';
    if (!hasVars(regionText)) {
        return <span className={
            `${ regionClasses[regionKind] } ${ differingClass }`
        }>{ regionText }</span>;
    }

    const { contrastColor, colors } = vars;
    const { palette: { type, getContrastText }} = theme;
    const text = regionText.replace(globalEscapedRe(contrastColor), getContrastColorValue(theme));

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
                `${ regionClasses[regionKind] } ${ differingClass }`
            }>{ text }</span>;
        }(text, '')]
    }</>;
}
