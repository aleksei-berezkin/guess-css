import { PaletteType } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import { routes } from './routes';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { State, useSelector } from '../store/store';
import { stream } from 'fluent-streams';
import React, { useState } from 'react';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { useInlineSvg } from './inlineSvg';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';

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

    appMenuBtn: {
        float: 'right',
        color: 'currentColor',
    },
});

export function MyAppBar(p: {paletteType: PaletteType, setPaletteType: (paletteType: PaletteType) => void}) {
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

    function handleAbout() {
        closeMenu();
        navigate(routes.about);
    }

    const [darkTheme, setDarkTheme] = useState(p.paletteType === 'dark');

    function handleThemeChanged() {
        setDarkTheme(!darkTheme);
        setTimeout(() => {
            if (darkTheme) {
                p.setPaletteType('light');
            } else {
                p.setPaletteType('dark');
            }
        });
    }

    function closeMenu() {
        setMenuOpen(false);
        setAnchorEl(null);
    }

    const styles = useStyles();

    return <>
        <AppBar color={ p.paletteType === 'light' ? 'primary' : 'default' } position='sticky'>
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
                            <IconButton onClick={ handleAppMenuButtonClick } className={ styles.appMenuBtn }>
                                <MenuIcon titleAccess='App menu'/>
                            </IconButton>

                            <Menu open={ menuOpen }
                                  anchorEl={ anchorEl } getContentAnchorEl={ null }
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  transformOrigin={{ vertical: 'top', horizontal: 'right'}}
                                  onClose={ closeMenu }
                            >
                                <MenuItem onClick={ handleThemeChanged }>Dark theme <Switch
                                    checked={ darkTheme }
                                    onChange={ handleThemeChanged }
                                    color='secondary'
                                /></MenuItem>
                                <MenuItem onClick={ handleSelectPuzzlers }>Select puzzlers...</MenuItem>
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
