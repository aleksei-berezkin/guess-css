import FormGroup from "@material-ui/core/FormGroup";
import React, { useEffect, useState } from 'react';
import { FormControlLabel } from '@material-ui/core';
import Checkbox from "@material-ui/core/Checkbox";
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Topic, allTopics } from '../model/topic';
import { store, useSelector } from '../store/store';
import Button from "@material-ui/core/Button";
import { useNavigate } from 'react-router-dom';
import { genAndDisplayNewPuzzler } from '../store/thunks';
import { routes } from './routes';
import Typography from '@material-ui/core/Typography';
import ReactGA from 'react-ga';

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

export function SelectPuzzlers() {
    const styles = useStyles();
    const initialTopics = useSelector(state => state.topics);
    const [selectedTopics, setSelectedTopics] = useState(initialTopics);
    useEffect(() => ReactGA.pageview(routes.select), []);

    useEffect(() => void setSelectedTopics(initialTopics), [initialTopics]);

    function handleChange(t: Topic) {
        if (selectedTopics.includes(t)) {
            setSelectedTopics(selectedTopics.filter(tt => tt !== t));
        } else {
            setSelectedTopics([...selectedTopics, t]);
        }
    }

    const navigate = useNavigate();

    function handleApply() {
        const filteredTopics = allTopics.filter(t => selectedTopics.includes(t));
        store.reset(filteredTopics);
        ReactGA.event({
            category: 'SelectPuzzlers',
            action: `SelectPuzzlers_${store.current}`,
        });
        genAndDisplayNewPuzzler();
        navigate(routes.root);
    }

    function handleBack() {
        navigate(routes.root);
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
