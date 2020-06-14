import React, { ReactElement, useRef, useState } from 'react';
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

const useStyles = makeStyles(theme => ({
    footer: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1.5),
    }
}));

export function Choices(): ReactElement {
    const keyPrefix = useSelector(state => `${state.current}_`);

    const choices = useSelector(ofCurrentView(v => v?.styleChoices || []));
    const common = useSelector(ofCurrentView(v => v?.commonStyle || []));

    const correctChoice = useSelector(ofCurrentView(v => v?.correctChoice));
    const userChoice = useSelector(ofCurrentView(v => v?.userChoice));

    const btnBoxRef = useRef<HTMLDivElement | null>(null);
    const [btnBoxStyle, setBtnBoxStyle] = useState({} as { minHeight?: number });

    const dispatch = useDispatch();

    const classes = useStyles();

    function headerColor(i: number) {
        if (i === correctChoice && userChoice != null) {
            if (userChoice === correctChoice) {
                return 'userCorrect' as const;
            }
            return 'correct';
        }
        if (i === userChoice && userChoice !== correctChoice) {
            return 'incorrect';
        }
        return undefined;
    }

    function onClickChoice(choice: number) {
        if (userChoice == null) {
            setBtnBoxStyle({ minHeight: btnBoxRef.current!.getBoundingClientRect().height })
            dispatch(checkChoice(choice));
        }
    }

    return <Grid container justify='center'>{
        abc().zipWithIndex().take(choices.length)
            .map(([letter, i]) =>
                <Grid item key={ `${keyPrefix}_${i}` }>
                    <CodePaper
                        code={ choices[i] || [] }
                        collapsedCode={ common }
                        header={
                            <CodeHeader title={`CSS ${letter.toUpperCase()}`} color={ headerColor(i) }/>
                        }
                        footer = {
                            <Grid container justify='center' className={ classes.footer }>
                                <Grid item ref={ btnBoxRef } style={ btnBoxStyle }>
                                    {
                                        userChoice == null &&
                                        <Button onClick={() => onClickChoice(i) } variant='outlined'
                                                color='primary' size='small'>This!</Button>
                                    }
                                    {
                                        i === userChoice && userChoice === correctChoice &&
                                        <CheckCircleOutlineIcon color='primary'/>
                                    }
                                    {
                                        i === correctChoice && userChoice != null && userChoice !== correctChoice &&
                                        <CheckIcon/>
                                    }
                                    {
                                        i === userChoice && userChoice !== correctChoice &&
                                        <ErrorOutlineIcon/>
                                    }
                                </Grid>
                            </Grid>
                        }
                    />
                </Grid>
            )
            .toArray()
    }</Grid>
}
