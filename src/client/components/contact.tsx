import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { spacing } from './theme';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import FacebookIcon from '@material-ui/icons/Facebook';
import RedditIcon from '@material-ui/icons/Reddit';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles(theme => ({
    root: {
        margin: theme.spacing(spacing),
    },
    icon: {
        verticalAlign: -6,
    }
}));

export function ContactAuthor() {
    const classes = useStyles();

    return <Box className={ classes.root }>
        <Typography variant='body2' color='textSecondary'>Contact author: { ' ' }
            <Link target='_blank' color='inherit' href='https://www.facebook.com/people/Alexey-Berezkin/100005955309004'>
                <FacebookIcon className={ classes.icon }/>
            </Link> { ' ' }
            <Link target='_blank' color='inherit' href='https://www.reddit.com/user/basic-coder'>
                <RedditIcon className={ classes.icon }/>
            </Link>
        </Typography>
    </Box>
}
