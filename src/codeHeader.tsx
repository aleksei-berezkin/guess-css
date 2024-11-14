import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function CodeHeader(p: { title: string, backgroundColor?: string}) {
    return <AppBar position='static' color='default' sx={{ backgroundColor: p.backgroundColor }}>
        <Box sx={{ pt: 1, pl: 3, pr: 1, pb: 1 }}>
            <Typography variant='button'>{ p.title }</Typography>
        </Box>
    </AppBar>
}
