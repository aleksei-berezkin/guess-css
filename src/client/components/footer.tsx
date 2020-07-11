import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { spacing } from './theme';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import FacebookIcon from '@material-ui/icons/Facebook';
import RedditIcon from '@material-ui/icons/Reddit';
import TwitterIcon from '@material-ui/icons/Twitter';
import Box from '@material-ui/core/Box';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
    root: {
        margin: theme.spacing(spacing),
        textAlign: 'center',
    },
    icon: {
        verticalAlign: -6,
    }
}));

export function Footer() {
    const classes = useStyles();

    return <Box className={ classes.root }>
        <Typography variant='body2' color='textSecondary'>Contact author: { ' ' }
            <Link target='_blank' color='inherit' href='https://www.facebook.com/people/Alexey-Berezkin/100005955309004'>
                <FacebookIcon className={ classes.icon } titleAccess='Facebook profile'/>
            </Link> { ' ' }
            <Link target='_blank' color='inherit' href='https://www.reddit.com/user/basic-coder'>
                <RedditIcon className={ classes.icon } titleAccess='Reddit profile'/>
            </Link>
            <Link target='_blank' color='inherit' href='https://twitter.com/a_v_berezkin'>
                <TwitterIcon className={ classes.icon} titleAccess='Twitter profile'/>
            </Link>
        </Typography>
        <Link to='/credits' component={ RouterLink }>Credits</Link>
    </Box>
}
