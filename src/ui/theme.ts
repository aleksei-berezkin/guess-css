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
        ...(paletteType === 'dark' ? {
            primary: {
                main: '#90caf9',
            },
            background: {
                paper: '#1e1e1e',
                default: '#000000',
            },
        } : {}),
    },
    props: {
        MuiPaper: {
            square: true,
        },
    },
    overrides: {
        MuiTabs: {
            root: {
                minHeight: undefined,
            },
        },
        MuiTab: {
            root: {
                padding: 6,
                minHeight: undefined,
                '@media (min-width: 600px)': {
                    minWidth: 'unset',
                }
            },
        },
        ...(paletteType === 'dark' ? {
            MuiAppBar: {
                colorDefault: {
                    backgroundColor: '#424242',
                },
            },
        } : {})
    }
});

// TODO more on desktop
export const spacing = 1.0;
