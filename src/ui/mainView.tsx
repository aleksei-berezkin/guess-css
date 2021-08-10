import { PuzzlerRendered } from './puzzlerRendered';
import { Choices } from './choices';
import Grid from '@material-ui/core/Grid';
import { CodePaper } from './codePaper';
import { Footer } from './footer';
import React from 'react';
import { ofCurrentView, useSelector } from '../store/store';
import { CircularProgress } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';


const useStyles = makeStyles({
    spinnerRoot: {
        alignItems: 'center',
        display: 'flex',
        height: '100%',
        position: 'absolute',
        top: 0,
    },
});

export function MainView() {
    const htmlCode = useSelector(ofCurrentView('body', []));
    const styles = useStyles();

    if (!htmlCode.length) {
        return <div className={ styles.spinnerRoot }>
            <CircularProgress/>
        </div>
    }

    return <>
        <PuzzlerRendered/>
        <Choices/>
        <Grid item>
            <CodePaper body={{
                code: htmlCode,
            }} />
        </Grid>
        <Grid item>
            <Footer/>
        </Grid>
    </>
}