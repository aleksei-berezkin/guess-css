import { createTheme } from '@mui/material/styles';
import { Theme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface BreakpointOverrides {
        narrow: true;
    }
}

// https://mui.com/material-ui/migration/troubleshooting/#types-property-quot-palette-quot-quot-spacing-quot-does-not-exist-on-type-defaulttheme
declare module '@mui/styles/defaultTheme' {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface DefaultTheme extends Theme {}
}

export const theme = createTheme({
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
    colorSchemes: {
        light: {
            palette: {
                background: {
                    paper: '#ffffff',
                    default: '#f6f6f6',
                },
            },
        },
        dark: {
            palette: {
                primary: {
                    main: '#90caf9',
                },
                background: {
                    paper: '#1e1e1e',
                    default: '#000000',
                },
            },
        },
    },
    components: {
        MuiTabs: {
            styleOverrides: {
                root: {
                    minHeight: undefined,
                }
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    padding: 6,
                    minHeight: undefined,
                    '@media (min-width: 600px)': {
                        minWidth: 'unset',
                    }
                },
            }
        },
    },
});

// TODO more on desktop
export const spacing = 1.0;
