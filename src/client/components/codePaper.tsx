import React, { ReactElement, useState } from 'react';
import { Region } from '../model/region';
import { stream, streamOf } from '../stream/stream';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useSelector } from 'react-redux';
import { ofCurrentView } from '../redux/store';
import { CodeBody } from './codeBody';
import { spacing } from './theme';

const makeRootStyles = makeStyles(theme => ({
    root: (sideMargins: boolean) => ({
        marginTop: theme.spacing(spacing),
        marginLeft: theme.spacing(sideMargins && spacing || 0),
        marginRight: theme.spacing(sideMargins && spacing || 0),
    }),
}));

export function CodePaper(
    p: {
        code: Region[][],
        collapsedCode?: Region[][],
        header?: ReactElement,
        footer?: ReactElement,
        sideMargins?: boolean,
    }
) {
    const commonStyleSummary = useSelector(ofCurrentView('commonStyleSummary', []));
    const classes = makeRootStyles(!!p.sideMargins);

    return <Paper className={ classes.root }>
        {
            p.header
        }

        <CodeBody lines={ p.code } noBottomPadding={ !!p.collapsedCode } />

        {
            p.collapsedCode &&
            <SimpleCollapsed summary={ commonStyleSummary }>
                <CodeBody lines={ p.collapsedCode }/>
            </SimpleCollapsed>
        }

        {
            p.footer
        }
    </Paper>;
}


const makeCollapsedStyles = makeStyles(theme => ({
    summary: {
        cursor: 'pointer',
        paddingRight: theme.spacing(1),
    },
    expandIcon: {
        transform: 'rotate(0deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandIconOpen: {
        transform: 'rotate(90deg)',
    },
}));

function SimpleCollapsed(p: { summary: string[], children: ReactElement }) {
    const [collapsedOpen, setCollapsedOpen] = useState(false);
    const classes = makeCollapsedStyles();

    function toggleCollapsed(e: React.MouseEvent) {
        setCollapsedOpen(!collapsedOpen);
        e.stopPropagation();
    }

    return <>

        <Typography
            variant='caption'
            className={ `${classes.summary}` }
            color='textSecondary'
            component='label'
        >
            <IconButton size='small' onClick={ toggleCollapsed } color='inherit'>
                <ChevronRightIcon fontSize='small' className={
                    streamOf(classes.expandIcon)
                        .appendIf(collapsedOpen, classes.expandIconOpen)
                        .join(' ')
                } titleAccess={ collapsedOpen ? 'collapse' : 'expand'}/>
            </IconButton>
            {
                stream(p.summary)
                    .zipWithIndex()
                    .map(([s, i]) => i < 4 ? s : '...')
                    .take(5)
                    .joinBy((_, r) => r === '...' ? '' : ', ')
            }
        </Typography>

        <Collapse in={ collapsedOpen }>{
            p.children
        }</Collapse>
    </>;
}
