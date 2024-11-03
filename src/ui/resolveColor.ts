import { PaletteMode } from '@mui/material';
import { red } from '@mui/material/colors';
import { blue } from '@mui/material/colors';
import { blueGrey } from '@mui/material/colors';
import { amber } from '@mui/material/colors';
import { orange } from '@mui/material/colors';
import { brown } from '@mui/material/colors';
import { AssignedColorVar, Hue } from '../store/assignColorVar';
import { ColorVarType } from '../model/gen/vars';

const colors: {
    [hue in Hue]: {
        [paletteType in PaletteMode]: {
            [colorType in ColorVarType]: string;
        }
    }
} = {
    red: {
        light: {
            background: red[100],
            border: red[600],
        },
        dark: {
            background: red[700],
            border: red[200],
        }
    },
    blue: {
        light: {
            background: blue[200],
            border: blue[600],
        },
        dark: {
            background: blue[700],
            border: blue[200],
        }
    },
    gray: {
        light: {
            background: blueGrey[200],
            border: blueGrey[500],
        },
        dark: {
            background: blueGrey[400],
            border: blueGrey[200],
        },
    },
    yellow: {
        light: {
            background: amber[200],
            border: amber[900], 
        },
        dark: {
            background: orange[900],
            border: amber[400],
        },
    },
    brown: {
        light: {
            background: brown[100],
            border: brown[500],
        },
        dark: {
            background: brown[400],
            border: brown[100],
        },
    },
};

export function resolveColor(assignedColorVar: AssignedColorVar, paletteMode: PaletteMode): string {
    return colors[assignedColorVar.hue][paletteMode][assignedColorVar.type];
}
