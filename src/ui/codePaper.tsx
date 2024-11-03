import React, { ReactElement, useState } from 'react';
import { Region } from '../model/region';
import makeStyles from '@mui/styles/makeStyles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ofCurrentView, useSelector } from '../store/store';
import { CodeBody } from './codeBody';
import { spacing } from './theme';
//@ts-ignore
import SwipeableViews from 'react-swipeable-views-react-18-fix';

const makeRootStyles = makeStyles(theme => ({
    root: (p: {hasSideMargins: boolean, isTabs: boolean}) => ({
        marginTop: theme.spacing(spacing),
        marginLeft: theme.spacing(p.hasSideMargins && spacing || 0),
        marginRight: theme.spacing(p.hasSideMargins && spacing || 0),
        width: p.isTabs ? '70%' : 'inherit',
        minWidth: p.isTabs ? 270 : 'inherit',
        maxWidth: p.isTabs ? 400 : 'inherit',
    }),
}));

export type CodeTabs = {
    tabs: CodePaperBody[],
    currentIndex: number,
    handleChangeIndex: (index: number) => void,
}

export type CodePaperBody = {
    code: Region[][],
    collapsedCode?: Region[][],
    footer?: ReactElement,
};

function isTabs(b: CodeTabs | CodePaperBody): b is CodeTabs {
    return 'tabs' in b;
}

export function CodePaper(
    p: {
        header?: ReactElement,
        body: CodeTabs | CodePaperBody,
        sideMargins?: boolean,
    }
) {
    const body = p.body;
    const classes = makeRootStyles({hasSideMargins: !!p.sideMargins, isTabs: isTabs(body)});

    return <Paper className={ classes.root }>
        {
            p.header
        }
        {
            isTabs(body) &&
            <SwipeableViews index={ body.currentIndex } onChangeIndex={ body.handleChangeIndex }>{
                body.tabs
                    .map((tab, index) =>
                        <Body key={ index } code={ tab.code } collapsedCode={ tab.collapsedCode } footer={ tab.footer }/>
                    )
            }</SwipeableViews>
        }
        {
            !isTabs(body) &&
            <Body code={ body.code } collapsedCode={ body.collapsedCode } footer={ body.footer }/>
        }
    </Paper>;
}

function Body(p: CodePaperBody) {
    const commonStyleSummary = useSelector(ofCurrentView('commonStyleSummary', []));

    return <>
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
    </>
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

const summarySep = ', ';
const summaryEllipsis = '...';

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
                <ChevronRightIcon
                    fontSize='small'
                    className={ `${classes.expandIcon} ${collapsedOpen ? classes.expandIconOpen : ''}` }
                    titleAccess={ collapsedOpen ? 'collapse' : 'expand'}
                />
            </IconButton>
            {
                p.summary
                    .reduce((acc, s) => {
                        if (acc.endsWith(summaryEllipsis)) {
                            return acc;
                        }

                        if (acc.length + summarySep.length + s.length + summaryEllipsis.length > 40) {
                            return acc + summaryEllipsis;
                        }

                        if (acc) {
                            return acc + summarySep + s;
                        }

                        return s;
                    }, '')
            }
        </Typography>

        <Collapse in={ collapsedOpen }>{
            p.children
        }</Collapse>
    </>;
}
