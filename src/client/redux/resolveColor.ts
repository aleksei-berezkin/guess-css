import { PaletteType } from '@material-ui/core';
import red from '@material-ui/core/colors/red';
import blue from '@material-ui/core/colors/blue';
import blueGrey from '@material-ui/core/colors/blueGrey';
import yellow from '@material-ui/core/colors/yellow';
import orange from '@material-ui/core/colors/orange';
import brown from '@material-ui/core/colors/brown';
import { AssignedColorVar, Hue } from './assignColorVar';
import { ColorVarType } from '../model/gen/vars';

const colors: {
    [hue in Hue]: {
        [paletteType in PaletteType]: {
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
            background: yellow[400],
            border: yellow[900], 
        },
        dark: {
            background: orange[900],
            border: yellow[500],
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

export function resolveColor(assignedColorVar: AssignedColorVar, paletteType: PaletteType): string {
    return colors[assignedColorVar.hue][paletteType][assignedColorVar.type];
}
