import { ScrollToTop } from './scrollToTop';
import { Route, Routes } from 'react-router-dom';
import { routes } from './routes';
import Grid from '@material-ui/core/Grid';
import { Credits } from './credits';
import { About } from './about';
import React from 'react';
import { SelectPuzzlers } from './selectPuzzlers';
import { MainView } from './mainView';

export function MyAppBody(p: { basename: string | undefined }) {
    return <>
        <ScrollToTop />
        <Routes basename={ p.basename }>
            <Route path={ routes.root }>
                <Grid container direction='column' alignItems='center' component='main'>
                    <MainView/>
                </Grid>
            </Route>
            <Route path={ routes.credits }>
                <Credits/>
            </Route>
            <Route path={ routes.about }>
                <About/>
            </Route>
            <Route path={ routes.select }>
                <SelectPuzzlers/>
            </Route>
        </Routes>
    </>
}
