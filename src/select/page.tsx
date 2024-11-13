'use client'

import FormGroup from "@mui/material/FormGroup";
import { useEffect, useState } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from "@mui/material/Checkbox";
import makeStyles from '@mui/styles/makeStyles';
import { Topic, allTopics } from '../model/topic';
import { store, useSelector } from '../store/store';
import Button from "@mui/material/Button";
import { genAndDisplayNewPuzzler } from '../store/thunks';
import { routes } from '../routes';
import Typography from '@mui/material/Typography';
import { gaEvent, gaPageview } from '../ga';
import { useNavigate } from 'react-router';

const useStyles = makeStyles(theme => ({
    selectPuzzlersRoot: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing(2),
    },

    checkboxesGroup: {
        paddingLeft: theme.spacing(3),
    },

    buttonsGroup: {
        paddingTop: theme.spacing(1),
        '&>*:not(:last-child)': {
            marginRight: theme.spacing(2),
        },
    },
}));

export default function SelectPage() {
    const styles = useStyles();
    const initialTopics = useSelector(state => state.persistent.topics);
    const [selectedTopics, setSelectedTopics] = useState(initialTopics);
    useEffect(() => gaPageview(routes.select), []);

    useEffect(() => void setSelectedTopics(initialTopics), [initialTopics]);

    function handleChange(t: Topic) {
        if (selectedTopics.includes(t)) {
            setSelectedTopics(selectedTopics.filter(tt => tt !== t));
        } else {
            setSelectedTopics([...selectedTopics, t]);
        }
    }

    const navigate = useNavigate()

    function handleApply() {
        const filteredTopics = allTopics.filter(t => selectedTopics.includes(t));
        store.reset(filteredTopics);
        gaEvent('SelectPuzzlers', String(filteredTopics.length));
        genAndDisplayNewPuzzler();
        navigate(routes.root)
    }

    function handleBack() {
        navigate(routes.root)
    }

    return <div className={ styles.selectPuzzlersRoot }>
        <div>
            <Typography variant='h6'>Select puzzlers:</Typography>
            <FormGroup className={ styles.checkboxesGroup }>
                {
                    allTopics.map(t =>
                        <FormControlLabel key={ t } control={
                            <Checkbox checked={ selectedTopics.includes(t) } onChange={() => handleChange(t) } color='secondary'/>
                        } label={ t }/>
                    )
                }
            </FormGroup>
            <div className={ styles.buttonsGroup }>
                <Button variant='contained' color='primary' onClick={ handleApply } disabled={ !selectedTopics.length }>
                    Apply and restart
                </Button>
                <Button variant='contained' onClick={ handleBack }>
                    Cancel
                </Button>
            </div>
        </div>
    </div>;
}
