import makeStyles from '@material-ui/core/styles/makeStyles';
import {
    mapCurrentView,
    ofCurrentView,
    ofCurrentViewOrUndefined,
    store,
    useSelector
} from '../store/store';
import useTheme from '@material-ui/core/styles/useTheme';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Badge, Theme } from '@material-ui/core';
import { resolveColor } from './resolveColor';
import { getContrastColorValue } from './contrastColorValue';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import { genAndDisplayNewPuzzler } from '../store/thunks';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import React from 'react';
import { globalEscapedRe } from './escapeRe';
import { allTopics } from '../model/topic';
import { PuzzlerView } from '../store/State';

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

    return <Grid container justify='center' alignItems='center' className={ classes.puzzleContainer }>
        <Grid item>
            <PrevButton/>
        </Grid>
        <Grid item>
            <Paper className={classes.layoutSize}>
                <iframe className={ `${classes.layoutSize} ${classes.iframe}` } srcDoc={
                    insertColors(source, vars, theme)
                }/>
            </Paper>
        </Grid>
        <Grid item>
            <NextButton/>
        </Grid>
    </Grid>;
}

function insertColors(src: string, vars: PuzzlerView['vars'] | undefined, theme: Theme): string {
    if (!vars) {
        return src;
    }

    const colorsInserted = vars.colors
        .reduceRight(
            (t, assignedCol) => t.replace(
                globalEscapedRe(assignedCol.id),
                resolveColor(assignedCol, theme.palette.type),
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

const useNextButtonStyles = makeStyles({
    badge: {
        transform: 'scale(1) translate(70%, -50%)',
    },
});

function NextButton() {
    const hasNext = useSelector(state => state.current < state.persistent.puzzlerViews.length - 1);
    const isAnswered = useSelector(mapCurrentView(v => v.status.userChoice != null, false));
    const isVeryFirst = useSelector(state => state.current === 0 && state.persistent.puzzlerViews.length === 1);

    const styles = useNextButtonStyles();

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
               classes={{
                   badge: styles.badge,
               }}
               color='secondary'
               overlap='rectangle'>
            <KeyboardArrowRight titleAccess='next puzzler'/>
        </Badge>
    </IconButton>
}
