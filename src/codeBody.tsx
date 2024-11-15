import { Region, regionKind, RegionKindLabel } from './model/region';
import Box from '@mui/material/Box';
import { ReactElement } from 'react';
import { ofCurrentViewOrUndefined, useSelector } from './store/store';
import { getContrastColorValue } from './contrastColorValue';
import { resolveColor } from './resolveColor';
import { hasVars } from './model/gen/vars';
import { escapeRe, globalEscapedRe } from './escapeRe';
import { Theme, useTheme } from '@mui/material';
import { monospaceFonts } from './monospaceFonts';

export function CodeBody(p: { lines: Region[][], noBottomPadding?: boolean }) {
    const inlineStyle = p.noBottomPadding ? { paddingBottom: 0 } : undefined;

    return <Box sx={{ p: 1 }} style={ inlineStyle }>{
        p.lines &&
        p.lines.map(
            (regions, i) => <Line key={ i } regions={ regions }/>
        )
    }</Box>;
}

function Line(p: {regions: Region[]}) {
    return <Box sx={{
        margin: 0,
        fontFamily: monospaceFonts,
        fontSize: 12,
        lineHeight: 1.18,
        letterSpacing: 0.0,
    }} component='pre'>{
        p.regions.map(
            (reg, i) => <RegionCode key={ i } region={ reg } />
        )
    }</Box>
}

const regionStylesObj = (theme: Theme) => ({
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
    return theme.palette.mode === 'light' ? light : dark;
}


function RegionCode(p: {region: Region}): ReactElement {
    const [regionText, regionKind, differing] = p.region;
    const vars = useSelector(ofCurrentViewOrUndefined('vars'));
    const theme = useTheme();

    if (!vars) {
        return <></>;
    }

    if (!hasVars(regionText)) {
        return <SimpleRegion text={ regionText } regionKind={ regionKind } differing={ !!differing } />
    }

    const { contrastColor, colors } = vars;
    const { palette: { mode, getContrastText }} = theme;
    const text = regionText.replace(globalEscapedRe(contrastColor), getContrastColorValue(theme));

    return <>{
        [...function* toSpans(text: string, key: string): IterableIterator<ReactElement> {
            for (const assignedCol of colors) {
                const match = new RegExp(`^(.*)(${ escapeRe(assignedCol.id) })(.*)$`).exec(text);
                if (match) {
                    if (match[1]) {
                        yield* toSpans(match[1], key + 'a');  
                    } 

                    const resolvedCol = resolveColor(assignedCol, mode);
                    yield <Box
                        key={ key + 'b'}
                        sx={{
                            backgroundColor: resolvedCol,
                            color: getContrastText(resolvedCol),
                            ...differing ? regionStylesObj(theme).differing : {},
                        }}
                        component='span'
                    >{ resolvedCol }</Box>;

                    if (match[3]) {
                        yield* toSpans(match[3], key + 'c');
                    } 

                    return;
                }
            }

            yield <SimpleRegion key={ key } text={ text } regionKind={ regionKind } differing={ !!differing } />
        }(text, '')]
    }</>;
}

function SimpleRegion(p: {text: string, regionKind: RegionKindLabel, differing: boolean}) {
    return <Box
                sx={ theme => ({
                    ...regionStylesObj(theme)[p.regionKind],
                    ...p.differing ? regionStylesObj(theme).differing : {}
                })}
                component='span'
            >{ p.text }</Box>
}
