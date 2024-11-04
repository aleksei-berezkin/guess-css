import { useNavigate } from 'react-router-dom';
import { routes } from './routes';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { store, useSelector } from '../store/store';
import React, { useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useInlineSvg } from './inlineSvg';
import makeStyles from '@mui/styles/makeStyles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import { lastOrUndefined } from '../util/lastOrUndefined';
import { State } from '../store/State';
import { allTopics } from '../model/topic';
import { genAndDisplayNewPuzzler } from '../store/thunks';
import { leadingZeros3 } from '../util/leadingZeros3';
import { gaEvent } from './ga';
import { PaletteMode } from '@mui/material';

const useStyles = makeStyles({
    appName: {
        whiteSpace: 'nowrap',
        '@media (max-width: 350px)': {
            fontSize: '1.1rem',
        },
    },

    containerGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr max-content 1fr',
        alignItems: 'center',
    },
});

export function MyAppBar(p: {paletteMode: PaletteMode, setPaletteMode: (paletteMode: PaletteMode) => void}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

    function handleAppMenuButtonClick(e: React.MouseEvent) {
        setMenuOpen(!menuOpen);
        if (menuOpen) {
            setAnchorEl(null);
        } else {
            setAnchorEl(e.currentTarget);
        }
    }

    const navigate = useNavigate();

    function handleSelectPuzzlers() {
        closeMenu();
        navigate(routes.select);
    }

    function handleRestart() {
        closeMenu();
        setTimeout(() => {
            const notAllTopicsSelected = store.persistent.topics.length !== allTopics.length;
            const msg = `This will ${ notAllTopicsSelected ? 'reset topics selection and ' : '' }restart the game. Continue?`
            if (window.confirm(msg)) {
                store.reset(allTopics);
                gaEvent('RestartGame', leadingZeros3(store.current));
                genAndDisplayNewPuzzler();
            }
        }, 100);
    }

    function handleAbout() {
        closeMenu();
        navigate(routes.about);
    }

    function togglePaletteMode() {
        setTimeout(function() {
            if (p.paletteMode === 'dark') {
                p.setPaletteMode('light');
            } else {
                p.setPaletteMode('dark');
            }
        });
    }

    function closeMenu() {
        setMenuOpen(false);
        setAnchorEl(null);
    }

    const styles = useStyles();

    return <>
        <AppBar color={ p.paletteMode === 'light' ? 'primary' : 'default' } position='sticky'>
            <Toolbar variant='dense'>
                <Container maxWidth='sm' disableGutters>
                    <div className={ styles.containerGrid }>
                        <div>
                            <Typography variant='h6' className={ styles.appName }>
                                Guess CSS!
                            </Typography>
                        </div>

                        <div>
                            <Score/>
                            <DonePuzzler/>
                        </div>

                        <div>
                            <IconButton onClick={ handleAppMenuButtonClick } sx={{ float: 'right', color: 'unset' }}>
                                <MenuIcon titleAccess='App menu'/>
                            </IconButton>

                            <Menu open={ menuOpen }
                                  anchorEl={ anchorEl }
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  transformOrigin={{ vertical: 'top', horizontal: 'right'}}
                                  onClose={ closeMenu }
                            >
                                <MenuItem onClick={ togglePaletteMode }>Dark theme
                                    <Switch
                                        checked={ p.paletteMode === 'dark' }
                                        onChange={ togglePaletteMode }
                                        color='secondary'
                                    />
                                </MenuItem>
                                <MenuItem onClick={ handleSelectPuzzlers }>Select puzzlers...</MenuItem>
                                <MenuItem onClick={ handleRestart }>Restart...</MenuItem>
                                <MenuItem onClick={ handleAbout }>About...</MenuItem>
                            </Menu>
                        </div>
                    </div>
                </Container>
            </Toolbar>
        </AppBar>
    </>;
}

function Score() {
    const isLast = useSelector(state => state.current === state.persistent.puzzlerViews.length - 1);
    const correctAnswers = useSelector(state => state.persistent.correctAnswers);
    const incorrectAnswers = useSelector(state => getDonePuzzlersNum(state) - state.persistent.correctAnswers);
    const inlineSvg = useInlineSvg();

    return <>{
        isLast &&
        <Typography><CheckIcon fontSize='small' className={ inlineSvg.score }/> {correctAnswers} : {incorrectAnswers} <CloseIcon fontSize='small' className={ inlineSvg.score }/></Typography>
    }</>;
}

function DonePuzzler() {
    const isHistory = useSelector(state => state.current < state.persistent.puzzlerViews.length - 1);
    const historyPuzzlerPos = useSelector(state => state.current + 1);
    const donePuzzlersNum = useSelector(getDonePuzzlersNum);

    return <>{
        isHistory &&
        <Typography>{ historyPuzzlerPos } / { donePuzzlersNum }</Typography>
    }</>
}

function getDonePuzzlersNum(state: State) {
    if (!state.persistent.puzzlerViews.length) {
        return 0;
    }
    if (lastOrUndefined(state.persistent.puzzlerViews)?.status.userChoice != null) {
        return state.persistent.puzzlerViews.length;
    }
    return state.persistent.puzzlerViews.length - 1;
}
