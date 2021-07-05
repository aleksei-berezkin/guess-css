import { Theme } from '@material-ui/core';

export const getContrastColorValue = (theme: Theme) =>
    theme.palette.type === 'light'
        ? theme.palette.common.black
        : theme.palette.common.white;
