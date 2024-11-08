import makeStyles from '@mui/styles/makeStyles';
import {
    mapCurrentView,
    ofCurrentView,
    ofCurrentViewOrUndefined,
    store,
    useSelector
} from './store/store';
import Paper from '@mui/material/Paper';
import { Badge, Grid2, Theme } from '@mui/material';
import { resolveColor } from './resolveColor';
import { getContrastColorValue } from './contrastColorValue';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import { genAndDisplayNewPuzzler } from './store/thunks';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import React from 'react';
import { globalEscapedRe } from './escapeRe';
import { allTopics } from './model/topic';
import { PuzzlerView } from './store/State';
import { useTheme } from '@mui/styles';

const useStyles = makeStyles(theme => ({
    puzzleContainer: {
        paddingTop: theme.spacing(1),
    },
    layoutSize: {
        height: 130,
        width: 190,
        [theme.breakpoints.up('narrow')]: {
            width: 240,
        },
    },
    iframe: {
        border: 'none',
    },
}));

export function PuzzlerRendered() {
    const source = useSelector(ofCurrentView('source', ''));
    const vars = useSelector(ofCurrentViewOrUndefined('vars'));
    const theme = useTheme();
    const classes = useStyles();

    return <Grid2 container sx={{justify: 'center', alignItems: 'center'}} className={ classes.puzzleContainer }>
        <div>
            <PrevButton/>
        </div>
        <div>
            <Paper className={ classes.layoutSize } square={ true }>
                <iframe className={ `${classes.layoutSize} ${classes.iframe}` } srcDoc={
                    insertColors(source, vars, theme)
                }/>
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
