'use client'

import {useEffect} from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { ContentPage } from '../contentPage';
import CodeIcon from '@mui/icons-material/Code';
import { Contacts } from '../contacts';
import { Link as RouterLink } from 'react-router-dom';
import { allTopics } from '../model/topic';
import { routes } from '../routes';
import { gaPageview } from '../ga';
import { Link } from '@mui/material';

export default function AboutPage() {
    useEffect(() => gaPageview(routes.about), []);

    const mb = 1

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
        <Typography sx={{ mb }}>Your task is to guess which of three CSS snippets was used to render the fragment!
            After you made your guess the app shows which one was correct, and updates your score displayed
            at the top.</Typography>
        <Typography sx={{ mb }}>Navigate between current and done tasks with arrows to the left and right of the frame.</Typography>

        <Typography sx={{ mb }}>The game has the following puzzlers:</Typography>
        <List dense>
        {
            allTopics.map(t => <ListItem key={ t }><Marker/><Typography>{ t }</Typography></ListItem>)
        }
        </List>
        <Typography sx={{ mb }}>If you don’t like them all, use app menu to select only a subset.</Typography>

        <Typography variant='h4'>Have something to say?</Typography>
        <Typography sx={{ mb }}>You are welcome! Use any of links below:</Typography>
        <Contacts large/>

        <Typography variant='h4'>Credits</Typography>
        <Typography>Like any modern software, “Guess CSS!” is built with the usage of many awesome tools, libs
            and assets. <Link to={ routes.credits } component={ RouterLink }>Here</Link> is the full list.</Typography>

        <Typography variant='h4' style={{textAlign: 'center'}}>Have a nice play!</Typography>
    </ContentPage>;
}

function Marker() {
    return <CodeIcon fontSize='small' sx={{mb: '.15em', mr: 1.5}}/>
}
