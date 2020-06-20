import React, { ReactElement, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ofCurrentView, State } from '../redux/store';
import { checkChoice } from '../redux/thunks';
import Grid from '@material-ui/core/Grid';
import { abc } from '../stream/stream';
import { CodePaper } from './codePaper';
import { CodeHeader } from './codeHeader';
import Button from '@material-ui/core/Button';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CheckIcon from '@material-ui/icons/Check';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { ChoiceStatus, getChoiceStatus, useChoiceStyles } from './choiceStatus';
import { setCurrentTab, setFooterBtnHeight } from '../redux/actions';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Dispatch } from 'redux';


export function Choices(): ReactElement {
    const theme = useTheme();
    const ssr = useSelector(state => state.ssr);
    const isWide = useMediaQuery(theme.breakpoints.up('md')) || ssr?.wide;

    return isWide && <WideChoices/> || <NarrowChoices/>;
}

const currentSelector = (state: State) => state.current;
const choicesSelector = ofCurrentView(v => v?.styleChoices || []);
const commonSelector = ofCurrentView(v => v?.commonStyle || []);
const statusSelector = ofCurrentView(v => v?.status);

function dispatchCheckChoice(choice: number, status: State['puzzlerViews'][number]['status'] | undefined, dispatch: Dispatch<any>) {
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
    const classes = useChoiceStyles();

    const dispatch = useDispatch();

    return <Grid container justify='center'>{
        abc().zipWithIndex().take(choices.length)
            .map(([letter, i]) =>
                <Grid item key={ current + letter }>
                    <CodePaper
                        code={ choices[i] || [] }
                        collapsedCode={ common }
                        header={
                            <CodeHeader title={`CSS ${letter.toUpperCase()}`} className={ classes[getChoiceStatus(i, status)] }/>
                        }
                        footer = {
                            <FooterButton status={ getChoiceStatus(i, status) } checkChoice={ dispatchCheckChoice(i, status, dispatch) }/>
                        }
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
    const currentTab = useSelector(ofCurrentView(v => v?.currentTab || 0));
    const classes = useChoiceStyles();

    const handleChange = (event: React.ChangeEvent<{}>, currentTab: number) => {
        dispatch(setCurrentTab({currentPuzzler, currentTab}));
    };

    const dispatch = useDispatch();

    return <CodePaper
        code={ choices[currentTab] || [] }
        collapsedCode={ common }
        header={
            <AppBar position='static' color='default'>
                <Tabs
                    value={ currentTab }
                    onChange={ handleChange }
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
        footer={
            <FooterButton status={ getChoiceStatus(currentTab, status) } checkChoice={ dispatchCheckChoice(currentTab, status, dispatch) }/>
        }
    />;    
}

const useFooterStyles = makeStyles(theme => ({
    footer: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1.5),
    }
}));


function FooterButton(p: {status: ChoiceStatus, checkChoice: () => void}) {
    const footerStyle = useSelector(state => {
        if (state.footerBtnHeight) {
            return {
                minHeight: state.footerBtnHeight,
            }
        }
        return undefined;
    });
    const btnBoxRef = useRef<HTMLDivElement | null>(null);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!footerStyle) {
            dispatch(setFooterBtnHeight(btnBoxRef.current!.getBoundingClientRect().height));
        }
    }, ['const']);

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
                <CheckCircleOutlineIcon color='primary'/>
            }
            {
                p.status === 'correct' &&
                <CheckIcon/>
            }
            {
                p.status === 'incorrect' &&
                <ErrorOutlineIcon/>
            }
        </Grid>
    </Grid>
}
