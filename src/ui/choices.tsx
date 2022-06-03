import React, { ReactElement, useEffect, useRef } from 'react';
import { ofCurrentView, ofCurrentViewOrUndefined, PuzzlerView, State, store, useSelector } from '../store/store';
import { checkChoice } from '../store/thunks';
import Grid from '@material-ui/core/Grid';
import { CodePaper } from './codePaper';
import { CodeHeader } from './codeHeader';
import Button from '@material-ui/core/Button';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CheckIcon from '@material-ui/icons/Check';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { ChoiceStatus, getChoiceStatus, makeChoiceStyles } from './choiceStatus';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { spacing } from './theme';
import { abc } from '../util/abc';


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
            checkChoice(choice);
        }
    }
}

function WideChoices() {
    const current = useSelector(currentSelector);
    const choices = useSelector(choicesSelector);
    const common = useSelector(commonSelector);
    const status = useSelector(statusSelector);
    const classes = makeChoiceStyles();

    return <Grid container justify='center'>{
        abc(choices.length)
            .map((letter, i) =>
                <Grid item key={ current + letter }>
                    <CodePaper
                        header={
                            <CodeHeader title={`CSS ${letter.toUpperCase()}`} className={ classes[getChoiceStatus(i, status)] }/>
                        }
                        body={{
                            code: choices[i] || [],
                            collapsedCode: common,
                            footer: <FooterButton status={ getChoiceStatus(i, status) } checkChoice={ handleCheckChoice(i, status) }/>
                        }}
                        sideMargins={ i === 1 }
                    />
                </Grid>
            )
    }</Grid>    
}

function NarrowChoices() {
    const currentPuzzler = useSelector(currentSelector);
    const choices = useSelector(choicesSelector);
    const common = useSelector(commonSelector);
    const status = useSelector(statusSelector);
    const currentTab = useSelector(ofCurrentView('currentTab', 0));
    const classes = makeChoiceStyles();

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
                                 className={ classes[getChoiceStatus(i, status)]}
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

const useFooterStyles = makeStyles(theme => ({
    footer: {
        paddingTop: theme.spacing(spacing / 2),
        paddingBottom: theme.spacing(spacing),
    }
}));


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

    const classes = useFooterStyles();

    return <Grid container justify='center' className={ classes.footer }>
        <Grid item ref={ btnBoxRef } style={ footerStyle }>
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
        </Grid>
    </Grid>
}
