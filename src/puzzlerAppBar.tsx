import { routes } from './routes';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { store, useSelector } from './store/store';
import { useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { lastOrUndefined } from './util/lastOrUndefined';
import { State } from './store/State';
import { allTopics } from './model/topic';
import { genAndDisplayNewPuzzler } from './store/thunks';
import { leadingZeros3 } from './util/leadingZeros3';
import { gaEvent } from './ga';
import { Box, useColorScheme } from '@mui/material';
import { DarkModeOutlined, LightModeOutlined, SettingsBrightnessOutlined } from '@mui/icons-material';


export function PuzzlerAppBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);

    function handleAppMenuButtonClick(e: React.MouseEvent) {
        setMenuOpen(!menuOpen);
        if (menuOpen) {
            setAnchorEl(null);
        } else {
            setAnchorEl(e.currentTarget);
        }
    }

    const navigate = useNavigate()

    function handleSelectPuzzlers() {
        closeMenu();
        navigate(routes.select)
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

    function closeMenu() {
        setMenuOpen(false);
        setAnchorEl(null);
    }

    return <>
        <AppBar position='sticky'>
            <Toolbar variant='dense'>
                <Container maxWidth='sm' disableGutters>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr max-content 1fr', alignItems: 'center'}}>
                        <div>
                            <Typography variant='h6' sx={{ whiteSpace: 'nowrap', fontSize: 'min(max(1.1em, 2vw), 1.25em)' }}>
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
                                <ThemeMenuItem/>
                                <MenuItem onClick={ handleSelectPuzzlers }>Select puzzlers...</MenuItem>
                                <MenuItem onClick={ handleRestart }>Restart...</MenuItem>
                                <MenuItem onClick={ handleAbout }>About...</MenuItem>
                            </Menu>
                        </div>
                    </Box>
                </Container>
            </Toolbar>
        </AppBar>
    </>;
}

function Score() {
    const isLast = useSelector(state => state.current === state.persistent.puzzlerViews.length - 1);
    const correctAnswers = useSelector(state => state.persistent.correctAnswers);
    const incorrectAnswers = useSelector(state => getDonePuzzlersNum(state) - state.persistent.correctAnswers);

    const marginBottom = '-.18em'

    return <>{
        isLast &&
        <Typography><CheckIcon fontSize='small' sx={{ marginBottom }}/> {correctAnswers} : {incorrectAnswers} <CloseIcon fontSize='small' sx={{ marginBottom }}/></Typography>
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

function ThemeMenuItem() {
    const {mode, setMode} = useColorScheme()

    const ml = 1, mr = 1;

    return <MenuItem onClick={() => {
        if (mode === 'system')
            setMode('light')
        else if (mode === 'light')
            setMode('dark')
        else
            setMode('system')
    }}>
        Theme: <>{
            mode === 'system' ? <><SettingsBrightnessOutlined sx={{ml, mr}}/> System</>
                : mode === 'light' ? <><LightModeOutlined sx={{ml, mr}}/> Light</>
                : mode === 'dark' ? <><DarkModeOutlined sx={{ml, mr}}/> Dark</>
                : null
        }</>
    </MenuItem>
}
