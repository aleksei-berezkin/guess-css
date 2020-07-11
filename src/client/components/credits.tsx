import React from 'react';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import makeStyles from '@material-ui/core/styles/makeStyles';
import deps from '../../../generated/deps.json';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import { Link as RouterLink } from 'react-router-dom';


const useStyles = makeStyles({
    root: {
        textAlign: 'left',
    }
});

export function Credits() {
    const classes = useStyles();

    return <Box className={ classes.root }>
        <Link to='/' component={ RouterLink }>Back to puzzler</Link>
        <Typography variant='h4'>Credits</Typography>
        <Typography variant='h5'>Assets</Typography>
        <Typography variant='body2'>
            Font: <Link target='_blank' href='https://fonts.google.com/specimen/Roboto'>Roboto</Link>
        </Typography>
        <Typography variant='body2'>
            Code color themes: <Link target='_blank' href='https://code.visualstudio.com/'>VS Code</Link>
        </Typography>
        <Typography variant='body2'>
            Favicon by <Link target='_blank' href='https://www.flaticon.com/authors/pixel-perfect' title='Pixel perfect'>Pixel perfect</Link> from <Link target='_blank' href='https://flaticon.com/' title="Flaticon">Flaticon</Link>
        </Typography>

        <Typography variant='h5'>Dependencies</Typography>
        <TableContainer component={ Paper }>
            <Table size='small' padding='default'>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>License</TableCell>
                        <TableCell>Homepage</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{
                    deps.map(dep =>
                        <TableRow>
                            <TableCell>{ dep.depName }</TableCell>
                            <TableCell>{ dep.license }</TableCell>
                            <TableCell><Link target='_blank' href={ dep.homepage }>{ dep.homepage }</Link></TableCell>
                        </TableRow>
                    )
                }</TableBody>
            </Table>
        </TableContainer>
        <Link to='/' component={ RouterLink }>Back to puzzler</Link>
    </Box>
}
