import { PaletteType } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import { routes } from './routes';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Help from '@material-ui/icons/Help';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import BrightnessHigh from '@material-ui/icons/BrightnessHigh';
import { useSelector } from 'react-redux';
import { State } from '../store/store';
import { stream } from 'fluent-streams';
import React from 'react';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { useInlineSvg } from './inlineSvg';

export function MyAppBar(p: {paletteType: PaletteType, setPaletteType: (paletteType: PaletteType) => void}) {
    const togglePaletteType = () => {
        if (p.paletteType === 'light') {
            p.setPaletteType('dark');
        } else {
            p.setPaletteType('light');
        }
    };

    const navigate = useNavigate();
    const navigateToAbout = () => navigate(routes.about);

    return <>
        <AppBar color={ p.paletteType === 'light' ? 'primary' : 'default' } position='sticky'>
            <Toolbar variant='dense'>
                <Container maxWidth='sm' disableGutters>
                    <Grid container alignItems='center'>
                        <Grid item style={{ flexGrow: 1 }}>
                            <Typography variant="h6">
                                Guess CSS!
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Score/>
                            <DonePuzzler/>
                        </Grid>
                        <Grid item style={{ flexGrow: 1.03 }}>

                            <IconButton onClick={ navigateToAbout } style={{ float: 'right', color: 'currentColor' }}>
                                <Help color='inherit'/>
                            </IconButton>
                            <IconButton onClick={ togglePaletteType } style={{ float: 'right', color: 'currentColor' }}>
                                {
                                    p.paletteType === 'light' &&
                                    <Brightness2Icon titleAccess='dark theme'/> ||
                                    <BrightnessHigh titleAccess='lightTheme'/>
                                }
                            </IconButton>
                        </Grid>
                    </Grid>
                </Container>
            </Toolbar>
        </AppBar>
    </>;
}

function Score() {
    const isLast = useSelector(state => state.current === state.puzzlerViews.length - 1);
    const correctAnswers = useSelector(state => state.correctAnswers);
    const incorrectAnswers = useSelector(state => getDonePuzzlersNum(state) - state.correctAnswers);
    const inlineSvg = useInlineSvg();

    return <>{
        isLast &&
        <Typography><CheckIcon fontSize='small' className={ inlineSvg.score }/> {correctAnswers} : {incorrectAnswers} <CloseIcon fontSize='small' className={ inlineSvg.score }/></Typography>
    }</>;
}

function DonePuzzler() {
    const isHistory = useSelector(state => state.current < state.puzzlerViews.length - 1);
    const historyPuzzlerPos = useSelector(state => state.current + 1);
    const donePuzzlersNum = useSelector(getDonePuzzlersNum);

    return <>{
        isHistory &&
        <Typography>{ historyPuzzlerPos } / { donePuzzlersNum }</Typography>
    }</>
}

function getDonePuzzlersNum(state: State) {
    if (!state.puzzlerViews.length) {
        return 0;
    }
    if (stream(state.puzzlerViews).last().orElseUndefined()?.status.userChoice != null) {
        return state.puzzlerViews.length;
    }
    return state.puzzlerViews.length - 1;
}

