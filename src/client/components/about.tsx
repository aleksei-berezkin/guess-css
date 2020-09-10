import React from 'react';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { ContentPage } from './contentPage';
import Brightness2Icon from '@material-ui/icons/Brightness2';
import BrightnessHigh from '@material-ui/icons/BrightnessHigh';

export function About() {
    return <ContentPage>
        <Typography variant='h4'>Guess CSS!</Typography>
        <Typography variant='h5'>HTML and CSS puzzler game</Typography>
        <Typography component='p'>
            Do you think you know CSS well? Here's the game to test your knowledge! You are given: 
        </Typography>
        <List>
            <ListItem>Small frame containing some rendered fragment</ListItem>
            <ListItem>Three CSS snippets</ListItem>
            <ListItem>HTML snippet</ListItem>
        </List>
        <Typography>Your task is to guess which of three CSS fragments was used to render the frame!
            After you made your guess the app shows you which one was correct, and updates your score on the app bar
            at the top.</Typography>
        <Typography>Navigate between current and done tasks with arrows to the left and right of the frame.</Typography>
        <Typography>Use <Brightness2Icon fontSize='small'/> and <BrightnessHigh fontSize='small'/> to switch between dark and light themes.</Typography>
    </ContentPage>;
}
