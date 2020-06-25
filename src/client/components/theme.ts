import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { PaletteType } from '@material-ui/core';

declare module '@material-ui/core/styles/createBreakpoints' {
    // noinspection JSUnusedGlobalSymbols
    interface BreakpointOverrides {
        narrow: true;
    }
}

export const createTheme = (paletteType: PaletteType) => createMuiTheme({
    breakpoints: {
        values: {
            xs: 0,
            narrow: 350,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
        },
    },
    palette: {
        type: paletteType,
    },
    props: {
        MuiPaper: {
            square: true,
        },
    },
});
