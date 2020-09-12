import React from 'react';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { ContentPage } from './contentPage';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import BrightnessHigh from '@material-ui/icons/BrightnessHigh';
import CodeIcon from '@material-ui/icons/Code';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles(theme => ({
    pWithMargin: {
        marginBottom: theme.spacing(1),
    },
    bIcon: {
        marginBottom: -3,
    },
    marker: {
        marginBottom: 3,
        marginRight: theme.spacing(1.5),
    },
}));

export function About() {
    const styles = useStyles();

    return <ContentPage>
        <Typography variant='h4'>Guess CSS!</Typography>
        <Typography variant='h5'>HTML and CSS puzzler game</Typography>
        <Typography>
            Do you think you know CSS well? Here's the game to test your knowledge! You are given: 
        </Typography>
        <List dense>
            <ListItem><Marker/><Typography>Small frame containing some rendered fragment</Typography></ListItem>
            <ListItem><Marker/><Typography>Three CSS snippets</Typography></ListItem>
            <ListItem><Marker/><Typography>HTML snippet</Typography></ListItem>
        </List>
        <Typography className={ styles.pWithMargin }>Your task is to guess which of three CSS fragments was used to render the frame!
            After you made your guess the app shows which one was correct, and updates your score on the app bar
            at the top.</Typography>
        <Typography className={ styles.pWithMargin }>Navigate between current and done tasks with arrows to the left and right of the frame.</Typography>
        <Typography>Use <Brightness2Icon fontSize='small' className={ styles.bIcon }/> and <BrightnessHigh fontSize='small' className={ styles.bIcon }/> to
            switch between dark and light themes.</Typography>
    </ContentPage>;
}

function Marker() {
    const styles = useStyles();

    return <CodeIcon fontSize='small' className={ styles.marker }/>
}
