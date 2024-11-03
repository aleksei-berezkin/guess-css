import { ScrollToTop } from './scrollToTop';
import { routes } from './routes';
import { Credits } from './credits';
import { About } from './about';
import React from 'react';
import { SelectPuzzlers } from './selectPuzzlers';
import { MainView } from './mainView';
import { Route, Routes } from 'react-router-dom';
import { Grid2 } from '@mui/material';

export function MyAppBody(p: { basename: string | undefined }) {
    return <>
        <ScrollToTop />
        <Routes>
            <Route path={ routes.root } element={
                <Grid2 container direction='column' alignItems='center' component='main'>
                    <MainView/>
                </Grid2>
            }/>
            <Route path={ routes.credits } element={<Credits/>} />
            <Route path={ routes.about } element={ <About/> } />
            <Route path={ routes.select } element={ <SelectPuzzlers/> } />
        </Routes>
    </>
}
