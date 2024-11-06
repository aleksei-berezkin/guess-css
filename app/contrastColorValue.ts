import { Theme } from "@mui/material";

export const getContrastColorValue = (theme: Theme) =>
    theme.palette.mode === 'light'
        ? theme.palette.common.black
        : theme.palette.common.white;
