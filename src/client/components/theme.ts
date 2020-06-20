import createMuiTheme from '@material-ui/core/styles/createMuiTheme';

declare module '@material-ui/core/styles/createBreakpoints' {
    // noinspection JSUnusedGlobalSymbols
    interface BreakpointOverrides {
        narrow: true;
    }
}

export const createTheme = () => createMuiTheme({
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
        type: 'light',
    },
    props: {
        MuiPaper: {
            square: true,
        },
    },
});
