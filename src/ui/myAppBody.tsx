import { ofCurrentView, useSelector } from '../store/store';
import { ScrollToTop } from './scrollToTop';
import { Route, Routes } from 'react-router-dom';
import { routes } from './routes';
import Grid from '@material-ui/core/Grid';
import { PuzzlerRendered } from './puzzlerRendered';
import { Choices } from './choices';
import { CodePaper } from './codePaper';
import { Footer } from './footer';
import { Credits } from './credits';
import { About } from './about';
import React from 'react';

export function MyAppBody(p: { basename: string | undefined }) {
    const htmlCode = useSelector(ofCurrentView('body', []));

    return <>
        <ScrollToTop />
        <Routes basename={ p.basename }>
            <Route path={ routes.root }>
                <Grid container direction='column' alignItems='center' component='main'>
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
                </Grid>
            </Route>
            <Route path={ routes.credits }>
                <Credits/>
            </Route>
            <Route path={ routes.about }>
                <About/>
            </Route>
        </Routes>
    </>
}
