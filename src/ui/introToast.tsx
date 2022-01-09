import { Grow, Snackbar} from '@material-ui/core';
import React, {useEffect, useState} from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles(theme => ({
    snackbar: {
        opacity: .80,
        transition: 'opacity 300ms',
        top: 96,
    },
}));

let openGlobal = true;

export function IntroToast() {
    const classes = useStyles();
    const [open, setOpen] = useState(openGlobal);

    function hide() {
        setOpen(false);
        openGlobal = false;
    }

    useEffect(() => {
        function handleClick() {
            hide();
        }
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    return <Snackbar
        autoHideDuration={ 2500 }
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
        className={ classes.snackbar }
        message='Which CSS renders this?'
        onClose={ hide }
        open={ open }
        TransitionComponent={ Grow }
    />;
}
