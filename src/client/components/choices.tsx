import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ofCurrentView } from '../redux/store';
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
import { ChoiceStatus, getChoiceStatus } from './choiceStatus';
import { setFooterBtnHeight } from '../redux/actions';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';


export function Choices(): ReactElement {
    const keyPrefix = useSelector(state => `${state.current}_`);

    const choices = useSelector(ofCurrentView(v => v?.styleChoices || []));
    const common = useSelector(ofCurrentView(v => v?.commonStyle || []));

    const correctChoice = useSelector(ofCurrentView(v => v?.correctChoice));
    const userChoice = useSelector(ofCurrentView(v => v?.userChoice));

    const theme = useTheme();
    const isWide = useMediaQuery(theme.breakpoints.up('md'));

    const dispatch = useDispatch();

    // TODO other component
    const [current, setCurrent] = useState(0);
    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setCurrent(newValue);
    };


    function dispatchCheckChoice(choice: number) {
        return () => {
            if (userChoice == null) {
                dispatch(checkChoice(choice));
            }
        }
    }

    if (isWide) {
        return <Grid container justify='center'>{
            abc().zipWithIndex().take(choices.length)
                .map(([letter, i]) =>
                    <Grid item key={ keyPrefix + letter }>
                        <CodePaper
                            code={ choices[i] || [] }
                            collapsedCode={ common }
                            header={
                                <CodeHeader title={`CSS ${letter.toUpperCase()}`} status={ getChoiceStatus(i, correctChoice, userChoice) }/>
                            }
                            footer = {
                                <Footer status={ getChoiceStatus(i, correctChoice, userChoice) } checkChoice={ dispatchCheckChoice(i) }/>
                            }
                            sideMargins={ i === 1 }
                        />
                    </Grid>
                )
                .toArray()
        }</Grid>
    }

    return <>
        <CodePaper
            code={ choices[current] || [] }
            collapsedCode={ common }
            header={
                <AppBar position='static' color='default'>
                    <Tabs
                        value={ current }
                        onChange={ handleChange }
                        indicatorColor='primary'
                        textColor='primary'
                        variant='standard'
                    >{
                        abc().take(choices.length)
                            .map(letter =>
                                <Tab label={ `CSS ${ letter.toUpperCase() }` } key={ keyPrefix + letter }/>
                            )
                            .toArray()
                    }</Tabs>
                </AppBar>
            }
            footer={
                <Footer status={ getChoiceStatus(current, correctChoice, userChoice) } checkChoice={ dispatchCheckChoice(current) }/>
            }
        />
    </>
}

const useFooterStyles = makeStyles(theme => ({
    footer: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1.5),
    }
}));


function Footer(p: {status: ChoiceStatus, checkChoice: () => void}) {
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
