import FormGroup from "@mui/material/FormGroup";
import { useEffect, useState } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from "@mui/material/Checkbox";
import { Topic, allTopics } from '../model/topic';
import { store, useSelector } from '../store/store';
import Button from "@mui/material/Button";
import { genAndDisplayNewPuzzler } from '../store/thunks';
import { routes } from '../routes';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import { useLocation } from 'wouter';

export default function SelectPage() {
    const initialTopics = useSelector(state => state.persistent.topics);
    const [selectedTopics, setSelectedTopics] = useState(initialTopics);

    useEffect(() => void setSelectedTopics(initialTopics), [initialTopics]);

    function handleChange(t: Topic) {
        if (selectedTopics.includes(t)) {
            setSelectedTopics(selectedTopics.filter(tt => tt !== t));
        } else {
            setSelectedTopics([...selectedTopics, t]);
        }
    }

    const [, setLocation] = useLocation()

    function handleApply() {
        const filteredTopics = allTopics.filter(t => selectedTopics.includes(t));
        store.reset(filteredTopics);
        genAndDisplayNewPuzzler();
        setLocation(routes.root)
    }

    function handleBack() {
        setLocation(routes.root)
    }


    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Box>
            <Typography variant='h6'>Select puzzlers:</Typography>
            <FormGroup sx={{ pl: 3 }}>
                {
                    allTopics.map(t =>
                        <FormControlLabel key={ t } control={
                            <Checkbox checked={ selectedTopics.includes(t) } onChange={() => handleChange(t) } color='secondary'/>
                        } label={ t }/>
                    )
                }
            </FormGroup>
            <Box sx={{ pt: 1, '& > *:not(:last-child)': { mr: 2 } }}>
                <Button variant='contained' color='primary' onClick={ handleApply } disabled={ !selectedTopics.length }>
                    Apply and restart
                </Button>
                <Button variant='contained' onClick={ handleBack }>
                    Cancel
                </Button>
            </Box>
        </Box>
    </Box>;
}
