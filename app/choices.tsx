import React, { ReactElement, useEffect, useRef } from 'react';
import { ofCurrentView, ofCurrentViewOrUndefined, store, useSelector } from './store/store';
import { setUserChoice } from './store/thunks';
import { CodePaper } from './codePaper';
import { CodeHeader } from './codeHeader';
import Button from '@mui/material/Button';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { choiceBgColor, ChoiceStatus, getChoiceStatus } from './choiceStatus';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { spacing } from './theme';
import { abc } from './util/abc';
import { PuzzlerView, State } from './store/State';
import { useTheme } from '@mui/material-pigment-css';
import Box from '@mui/material-pigment-css/Box'
import { Grid2, Theme } from '@mui/material';
import { css } from '@pigment-css/react'


export function Choices(): ReactElement {
    const theme = useTheme();
    const isWide = useMediaQuery(theme.breakpoints.up('md'));

    return isWide && <WideChoices/> || <NarrowChoices/>;
}

const currentSelector = (state: State) => state.current;
const choicesSelector = ofCurrentView('styleChoices', []);
const commonSelector = ofCurrentView('commonStyle', []);
const statusSelector = ofCurrentViewOrUndefined('status');

function handleCheckChoice(choice: number, status: PuzzlerView['status'] | undefined) {
    return () => {
        if (status?.userChoice == null) {
            setUserChoice(choice);
        }
    }
}

function WideChoices() {
    const current = useSelector(currentSelector);
    const choices = useSelector(choicesSelector);
    const common = useSelector(commonSelector);
    const status = useSelector(statusSelector);
    const theme: Theme = useTheme();

    return <Grid2 container sx={{ justify: 'center' }}>{
        abc(choices.length)
            .map((letter, i) =>
                <div key={ current + letter }>
                    <CodePaper
                        header={
                            <CodeHeader title={`CSS ${letter.toUpperCase()}`} backgroundColor={ choiceBgColor[getChoiceStatus(i, status)][theme.palette.mode] }/>
                        }
                        body={{
                            code: choices[i] || [],
                            collapsedCode: common,
                            footer: <FooterButton status={ getChoiceStatus(i, status) } checkChoice={ handleCheckChoice(i, status) }/>
                        }}
                        sideMargins={ i === 1 }
                    />
                </div>
            )
    }</Grid2>
}

function NarrowChoices() {
    const currentPuzzler = useSelector(currentSelector);
    const choices = useSelector(choicesSelector);
    const common = useSelector(commonSelector);
    const status = useSelector(statusSelector);
    const currentTab = useSelector(ofCurrentView('currentTab', 0));
    const theme: Theme = useTheme()

    function handleChangeIndex(currentTab: number) {
        store.setCurrentTab(currentTab)
    }

    return <CodePaper
        header={
            <AppBar position='static' color='default'>
                <Tabs
                    value={ currentTab }
                    onChange={ (e, newTabIndex) => handleChangeIndex(newTabIndex) }
                    indicatorColor='primary'
                    textColor='primary'
                    variant='fullWidth'
                >{
                    abc(choices.length)
                        .map((letter, i) =>
                            <Tab label={ `CSS ${ letter.toUpperCase() }` }
                                 key={ currentPuzzler + letter }
                                 sx={{ backgroundColor: choiceBgColor[getChoiceStatus(i, status)][theme.palette.mode] }}
                            />
                        )
                }</Tabs>
            </AppBar>
        }
        body={{
            tabs: Array.from({length: choices.length})
                .map((_, i) => ({
                    code: choices[i] || [],
                    collapsedCode: common,
                    footer: <FooterButton status={ getChoiceStatus(i, status) } checkChoice={ handleCheckChoice(i, status) }/>
                })),
            currentIndex: currentTab,
            handleChangeIndex
        }}
    />;    
}

const footerClass = css(({ theme }) => ({
    justifyContent: 'center',
    paddingTop: theme.spacing(spacing / 2),
    paddingBottom: theme.spacing(spacing),
}))


function FooterButton(p: {status: ChoiceStatus, checkChoice: () => void}) {
    const footerStyle = useSelector(state => {
        if (state.layoutConstants.footerBtnHeight) {
            return {
                minHeight: state.layoutConstants.footerBtnHeight,
            }
        }
        return undefined;
    });
    const btnBoxRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!footerStyle) {
            store.setFooterBtnHeight(btnBoxRef.current!.getBoundingClientRect().height);
        }
    }, []);

    return <Grid2 container className={ footerClass }>
        <Box ref={ btnBoxRef } style={ footerStyle }>
            {
                p.status === 'notAnswered' &&
                <Button onClick={() => p.checkChoice() } variant='outlined'
                        color='primary' size='small'>This!</Button>
            }
            {
                p.status === 'userCorrect' &&
                <CheckCircleOutlineIcon color='primary' titleAccess='correct user answer'/>
            }
            {
                p.status === 'correct' &&
                <CheckIcon titleAccess='correct answer'/>
            }
            {
                p.status === 'incorrect' &&
                <ErrorOutlineIcon titleAccess='incorrect user answer'/>
            }
        </Box>
    </Grid2>
}
