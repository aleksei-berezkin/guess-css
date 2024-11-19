import { ReactElement, useState } from 'react';
import { Region } from './model/region';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ofCurrentView, useSelector } from './store/store';
import { CodeBody } from './codeBody';
import { ScrollSnapper } from './ScrollSnapper';


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

    return <Paper square={ true } sx={{
        mt: 1,
        ml: p.sideMargins ? 1 : 0,
        mr: p.sideMargins ? 1 : 0,
        width: isTabs(body) ? '70%' : 'inherit',
        minWidth: isTabs(body) ? 270 : 'inherit',
        maxWidth: isTabs(body) ? 400 : 'inherit',
    }}>
        {
            p.header
        }
        {
            isTabs(body) &&
            <ScrollSnapper
                index={ body.currentIndex }
                onIndexChange={ body.handleChangeIndex }
            >{
                body.tabs
                    .map((tab, index) =>
                        <div key={ index }><Body code={ tab.code } collapsedCode={ tab.collapsedCode } footer={ tab.footer }/></div>
                    )
            }</ScrollSnapper>
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
                    titleAccess={ collapsedOpen ? 'collapse' : 'expand'}
                    sx={ theme => ({
                        transform: collapsedOpen ? 'rotate(90deg)' : undefined,
                        transition: theme.transitions.create('transform', {
                            duration: theme.transitions.duration.shortest,
                        }),
                    })}
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
