import React, { ReactElement, useState } from 'react';
import { Region } from './model/region';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ofCurrentView, useSelector } from './store/store';
import { CodeBody } from './codeBody';
import { css } from '@pigment-css/react';
//@ts-expect-error No typedefs for this module
import SwipeableViews from 'react-swipeable-views-react-18-fix';

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

const paperClass = css({
    marginTop: 1
})

const paperWithSideMarginsClass = css({
    marginLeft: 1,
    marginRight: 1,
})

const paperTabsClass = css({
    width: '70%',
    minWidth: 270,
    maxWidth: 400
})

export function CodePaper(
    p: {
        header?: ReactElement,
        body: CodeTabs | CodePaperBody,
        sideMargins?: boolean,
    }
) {
    const body = p.body;
    const classes = `${ paperClass } ${ p.sideMargins ? paperWithSideMarginsClass : '' } ${ isTabs(body) ? paperTabsClass : '' }`

    return <Paper className={ classes } square={ true }>
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

const expandIconClass = css(({ theme }) => ({
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}))
const expandIconOpenClass = css({
    transform: 'rotate(90deg)',
})

const summarySep = ', ';
const summaryEllipsis = '...';

function SimpleCollapsed(p: { summary: string[], children: ReactElement }) {
    const [collapsedOpen, setCollapsedOpen] = useState(false);

    function toggleCollapsed(e: React.MouseEvent) {
        setCollapsedOpen(!collapsedOpen);
        e.stopPropagation();
    }

    return <>

        <Typography
            variant='caption'
            color='textSecondary'
            component='label'
            sx={{ cursor: 'pointer', pr: 1 }}
        >
            <IconButton size='small' onClick={ toggleCollapsed } color='inherit'>
                <ChevronRightIcon
                    fontSize='small'
                    className={ `${ expandIconClass } ${ collapsedOpen ? expandIconOpenClass : '' }` }
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
