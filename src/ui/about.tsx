import React from 'react';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { ContentPage } from './contentPage';
import CodeIcon from '@material-ui/icons/Code';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Contacts } from './contacts';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import { allTopics } from '../model/gen/topic';
import { routes } from './routes';

const useStyles = makeStyles(theme => ({
    bm: {
        marginBottom: theme.spacing(1),
    },
    marker: {
        marginBottom: '.15em',
        marginRight: theme.spacing(1.5),
    },
}));

export function About() {
    const styles = useStyles();

    return <ContentPage>
        <Typography variant='h4'>Guess CSS!</Typography>
        <Typography variant='h5'>HTML and CSS puzzler game</Typography>
        <Typography>
            Do you think you know CSS well? Here’s a game to test your knowledge! You are given: 
        </Typography>
        <List dense>
            <ListItem><Marker/><Typography>A frame containing some rendered fragment</Typography></ListItem>
            <ListItem><Marker/><Typography>Three CSS snippets</Typography></ListItem>
            <ListItem><Marker/><Typography>HTML snippet</Typography></ListItem>
        </List>
        <Typography className={ styles.bm }>Your task is to guess which of three CSS snippets was used to render the fragment!
            After you made your guess the app shows which one was correct, and updates your score displayed
            at the top.</Typography>
        <Typography className={ styles.bm }>Navigate between current and done tasks with arrows to the left and right of the frame.</Typography>

        <Typography className={ styles.bm }>The game has the following puzzlers:</Typography>
        <List dense>
        {
            allTopics.map(t => <ListItem><Marker/><Typography>{ t }</Typography></ListItem>)
        }
        </List>
        <Typography className={ styles.bm }>If you don’t like them all, use app menu to select only a subset.</Typography>

        <Typography variant='h4'>Have something to say?</Typography>
        <Typography className={ styles.bm }>You are welcome! Use any of links below:</Typography>
        <Contacts large/>

        <Typography variant='h4'>Credits</Typography>
        <Typography>Like any modern software, “Guess CSS!” is built with the usage of many awesome tools, libs
            and assets. <Link to={ routes.credits } component={ RouterLink }>Here</Link> is the full list.</Typography>

        <Typography variant='h4' style={{textAlign: 'center'}}>Have a nice play!</Typography>
    </ContentPage>;
}

function Marker() {
    const styles = useStyles();

    return <CodeIcon fontSize='small' className={ styles.marker }/>
}
