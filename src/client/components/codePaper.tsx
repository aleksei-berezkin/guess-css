import React, { ReactElement, useState } from 'react';
import { Region } from '../model/region';
import { stream } from '../stream/stream';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { useSelector } from 'react-redux';

type StylesProps = {
    withChildren: boolean,
    
}

const useStyles = makeStyles(theme => ({
    outer: {
        marginTop: theme.spacing(1.5),
        marginRight: theme.spacing(1.5),
        paddingBottom: (p: StylesProps) => p.withChildren ? theme.spacing(1) : 0,
    },
    codeHeader: {
        paddingTop: theme.spacing(1),
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    codeBody: {
        padding: theme.spacing(1.5),
    },
    expandButton: {
        color: theme.palette.grey![600],
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
    expandText: {
        color: theme.palette.grey![600],
        cursor: 'pointer',
    }
}));

export function CodePaper(
    p: {
        title: string,
        lines: Region[][],
        collapsedLines?: Region[][],
        headerClass?: string,
        children?: ReactElement
    }
) {
    const [linesShown, setLinesShown] = useState(false);
    const commonStylesSummary = useSelector(state => state.puzzlerViews[state.current]?.commonStylesSummary);
    const classes = useStyles({ withChildren: !!p.children });

    function toggleCollapsible(e: React.MouseEvent) {
        setLinesShown(!linesShown);
        e.stopPropagation();
    }

    return <Paper className={ classes.outer }>
        <AppBar position='static' color='default' className={ p.headerClass }>
            <Box className={ classes.codeHeader }>
                <Typography variant='button'>{ p.title }</Typography>
            </Box>
        </AppBar>
        <Box className={ `code ${classes.codeBody }` }>
            <Lines lines={ p.lines }/>
        </Box>
        {
            p.collapsedLines &&
            <>
                <IconButton size='small' className={ classes.expandButton } onClick={ toggleCollapsible }>
                    <ChevronRightIcon fontSize='small' className={ `${ classes.expandIcon } ${ linesShown ? classes.expandIconOpen : '' }` }/>
                </IconButton>
                <Typography variant='caption' className={ classes.expandText } onClick={ toggleCollapsible }>{ commonStylesSummary }</Typography>
                <Collapse in={ linesShown }>
                    <Box className={ `code ${classes.codeBody }` }>
                        <Lines lines={ p.collapsedLines }/>
                    </Box>
                </Collapse>
            </>
        }
        { p.children }
    </Paper>;
}

export function Lines(p: {lines: Region[][] | undefined}) {
    return <>{
        p.lines &&
        stream(p.lines).zipWithIndex().map(
            ([regions, i]) => <Line key={ i } regions={ regions }/>
        )
    }</>;
}

export function Line(p: {regions: Region[]}) {
    return <pre>{
        p.regions.map(
            (reg, i) => {
                const className = reg.differing
                    ? reg.kind + ' differing'
                    : reg.kind;

                return <span key={ i } className={ className } style={ getStyle(reg) }>{ reg.text }</span>;
            }
        )
    }</pre>
}

function getStyle(reg: Region) {
    if (reg.backgroundColor) {
        if (reg.color) {
            return {
                backgroundColor: reg.backgroundColor,
                color: reg.color,
            }
        }
        return {
            backgroundColor: reg.backgroundColor,
        }
    }
    return undefined;
}
