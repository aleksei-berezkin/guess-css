import { useEffect } from 'react';
import { genAndDisplayNewPuzzler, restoreAndDisplay } from './store/thunks';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme';
import { PuzzlerAppBar } from './puzzlerAppBar';
import { PuzzlerAppBody } from './puzzlerAppBody';
import { store } from './store/store';
import { readFromLocalStorage } from './store/myLocalStorage';
import { routes } from './routes';
import IndexPage from './page';
import AboutPage from './about/page';
import CreditsPage from './credits/page';
import SelectPage from './select/page';
import { Route, Switch } from 'wouter';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PuzzlerApp(p: {location?: string}) {
    useEffect(() => {
        const storedPersistent = readFromLocalStorage(store.persistent._version);
        if (storedPersistent) {
            restoreAndDisplay(storedPersistent);
        } else {
            genAndDisplayNewPuzzler();
        }
    }, []);


    return <ThemeProvider theme={ theme } defaultMode='system'>
        <CssBaseline/>
        <PuzzlerAppBar/>
        <PuzzlerAppBody>
        <Switch>
            <Route path={ routes.root }><IndexPage/></Route>
            <Route path={ routes.about }><AboutPage/></Route>
            <Route path={ routes.credits }><CreditsPage/></Route>
            <Route path={ routes.select }><SelectPage/></Route>
        </Switch>
        </PuzzlerAppBody>
    </ThemeProvider>
}
