import React, { ReactElement, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ofCurrentView, ofCurrentViewOrUndefined, State } from '../redux/store';
import { checkChoice } from '../redux/thunks';
import Grid from '@material-ui/core/Grid';
import { abc, range } from 'fluent-streams';
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
import { Dispatch } from 'redux';
import { spacing } from './theme';
import { PuzzlerView, puzzlerViews } from '../redux/slices/puzzlerViews';
import { layoutConstants } from '../redux/slices/layoutConstants';


export function Choices(): ReactElement {
    const theme = useTheme();
    const ssr = useSelector(state => state.ssr);
    const isWide = useMediaQuery(theme.breakpoints.up('md')) || ssr?.wide;

    return isWide && <WideChoices/> || <NarrowChoices/>;
}

const currentSelector = (state: State) => state.current;
const choicesSelector = ofCurrentView('styleChoices', []);
const commonSelector = ofCurrentView('commonStyle', []);
const statusSelector = ofCurrentViewOrUndefined('status');

function dispatchCheckChoice(choice: number, status: PuzzlerView['status'] | undefined, dispatch: Dispatch<any>) {
    return () => {
        if (status?.userChoice == null) {
            dispatch(checkChoice(choice));
        }
    }
}

function WideChoices() {
    const current = useSelector(currentSelector);
    const choices = useSelector(choicesSelector);
    const common = useSelector(commonSelector);
    const status = useSelector(statusSelector);
    const classes = makeChoiceStyles();

    const dispatch = useDispatch();

    return <Grid container justify='center'>{
        abc().zipWithIndex().take(choices.length)
            .map(([letter, i]) =>
                <Grid item key={ current + letter }>
                    <CodePaper
                        header={
                            <CodeHeader title={`CSS ${letter.toUpperCase()}`} className={ classes[getChoiceStatus(i, status)] }/>
                        }
                        body={{
                            code: choices[i] || [],
                            collapsedCode: common,
                            footer: <FooterButton status={ getChoiceStatus(i, status) } checkChoice={ dispatchCheckChoice(i, status, dispatch) }/>
                        }}
                        sideMargins={ i === 1 }
                    />
                </Grid>
            )
            .toArray()
    }</Grid>    
}

function NarrowChoices() {
    const currentPuzzler = useSelector(currentSelector);
    const choices = useSelector(choicesSelector);
    const common = useSelector(commonSelector);
    const status = useSelector(statusSelector);
    const currentTab = useSelector(ofCurrentView('currentTab', 0));
    const classes = makeChoiceStyles();

    const handleChangeIndex = (currentTab: number) => {
        dispatch(puzzlerViews.actions.setCurrentTab({index: currentPuzzler, currentTab}));
    };

    const dispatch = useDispatch();

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
                    abc().zipWithIndex().take(choices.length)
                        .map(([letter, i]) =>
                            <Tab label={ `CSS ${ letter.toUpperCase() }` }
                                 key={ currentPuzzler + letter }
                                 className={ classes[getChoiceStatus(i, status)]}
                            />
                        )
                        .toArray()
                }</Tabs>
            </AppBar>
        }
        body={{
            tabs: range(0, choices.length)
                .map(i => ({
                    code: choices[i] || [],
                    collapsedCode: common,
                    footer: <FooterButton status={ getChoiceStatus(i, status) } checkChoice={ dispatchCheckChoice(i, status, dispatch) }/>
                }))
                .toArray(),
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
    const dispatch = useDispatch();

    useEffect(() => {
        if (!footerStyle) {
            dispatch(layoutConstants.actions.setFooterBtnHeight(btnBoxRef.current!.getBoundingClientRect().height));
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
