import {
    mapCurrentView,
    ofCurrentView,
    ofCurrentViewOrUndefined,
    store,
    useSelector
} from './store/store';
import Paper from '@mui/material/Paper';
import { Badge, Box, Grid2, Theme, useTheme } from '@mui/material';
import { resolveColor } from './resolveColor';
import { getContrastColorValue } from './contrastColorValue';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import { genAndDisplayNewPuzzler } from './store/thunks';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { globalEscapedRe } from './escapeRe';
import { allTopics } from './model/topic';
import { PuzzlerView } from './store/State';

export function PuzzlerRendered() {
    const source = useSelector(ofCurrentView('source', ''));
    const vars = useSelector(ofCurrentViewOrUndefined('vars'));
    const theme = useTheme();

    const layoutSizeSx = {
        height: 130,
        width: 'calc(max(190px, min(45vw, 240px)))',
    }

return <Grid2 container sx={{justify: 'center', alignItems: 'center', pt: 1}}>
        <div>
            <PrevButton/>
        </div>
        <div>
            <Paper square={ true } sx={ layoutSizeSx }>
                <Box
                    sx={{
                        ...layoutSizeSx,
                        border: 'none',
                    }}
                    srcDoc={ insertColors(source, vars, theme) }
                    component='iframe'
                />
            </Paper>
        </div>
        <div>
            <NextButton/>
        </div>
    </Grid2>;
}

function insertColors(src: string, vars: PuzzlerView['vars'] | undefined, theme: Theme): string {
    if (!vars) {
        return src;
    }

    const colorsInserted = vars.colors
        .reduceRight(
            (t, assignedCol) => t.replace(
                globalEscapedRe(assignedCol.id),
                resolveColor(assignedCol, theme.palette.mode),
            ),
            src
        );

    const contrastColorValue = getContrastColorValue(theme);
    return colorsInserted.replace(
        globalEscapedRe(vars.contrastColor),
        contrastColorValue,
    );
}

function PrevButton() {
    const hasPrev = useSelector(state => state.current > 0);

    function handlePrev() {
        if (hasPrev) {
            store.displayPrevPuzzler();
        } else {
            throw new Error('Cannot navPrev')
        }
    }

    return <IconButton onClick={ handlePrev } disabled={ !hasPrev }>
        <KeyboardArrowLeft titleAccess='previous puzzler'/>
    </IconButton>;
}

function NextButton() {
    const hasNext = useSelector(state => state.current < state.persistent.puzzlerViews.length - 1);
    const isAnswered = useSelector(mapCurrentView(v => v.status.userChoice != null, false));
    const isVeryFirst = useSelector(state => state.current === 0 && state.persistent.puzzlerViews.length === 1);

    function handleNext() {
        if (hasNext) {
            store.displayNextPuzzler();
        } else if (isAnswered) {
            if (store.persistent.topics.length === allTopics.length
                && (store.current + 1) % store.persistent.topics.length === 0) {
                store.displayProgressDialog();
            } else {
                genAndDisplayNewPuzzler();
            }
        } else {
            throw new Error('Cannot navNext');
        }
    }

    return <IconButton onClick={ handleNext }
                       disabled={ !hasNext && !isAnswered }
                       color={ isAnswered && !hasNext ? 'primary' : 'default' }>
        <Badge badgeContent={ isVeryFirst && isAnswered ? 'next' : undefined }
            color='secondary'
            overlap='rectangular'>
            <KeyboardArrowRight titleAccess='next puzzler'/>
        </Badge>
    </IconButton>
}
