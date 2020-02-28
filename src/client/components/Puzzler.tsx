import React, { ReactElement, useEffect } from 'react';
import { Region } from '../../shared/api';
import { getPuzzlerUrl } from '../clientApi';
import * as R from 'ramda';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../redux/store';
import { CheckChoice, LoadNextPuzzler, NavNextPuzzler, NavPrevPuzzler, Type } from '../redux/actions';

export function Puzzler(): ReactElement {
    const initialized = useSelector((state: State) => state.puzzlers.length > 0);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!initialized) {
            const loadAction: LoadNextPuzzler = {
                type: Type.LOAD_NEXT_PUZZLER,
            };
            dispatch(loadAction);
        }
    }, [initialized]);

    return <>
        <h1>Guess the code snippet which produces this layout</h1>
        <Score/>
        <DonePuzzler/>
        <LayoutFrame/>
        <Choices/>
    </>
}

function Score() {
    const isLast = useSelector((st: State) => st.current === 0);
    const correctAnswers = useSelector((st: State) => st.correctAnswers);
    const donePuzzlersNum = useSelector(getDonePuzzlersNum)

    return <>{
        isLast &&
        <div>Correct answers: { correctAnswers } of { donePuzzlersNum }</div>
    }</>;
}

function DonePuzzler() {
    const isHistory = useSelector((st: State) => st.current > 0);
    const historyPuzzlerPos = useSelector((st: State) => st.puzzlers.length - st.current);
    const donePuzzlersNum = useSelector(getDonePuzzlersNum);

    return <>{
        isHistory &&
        <div>Done puzzler: { historyPuzzlerPos } of { donePuzzlersNum }</div>
    }</>
}

function getDonePuzzlersNum(st: State) {
    if (!st.puzzlers.length) {
        return 0;
    }
    if (st.puzzlers[0]?.answer) {
        return st.puzzlers.length;
    }
    return st.puzzlers.length - 1;
}

function LayoutFrame() {
    const id = useSelector((st: State) => st.puzzlers[st.current]?.id);
    const token = useSelector((st: State) => st.puzzlers[st.current]?.token);

    return <div className='puzzler-top'>
        <PrevButton/>
        <>{
            id && token &&
            <iframe className='layout' src={ getPuzzlerUrl(id, token) }/>
        }</>
        <NextButton/>
    </div>;
}

function PrevButton() {
    const hasPrev = useSelector((st: State) => st.current < st.puzzlers.length - 1);
    const dispatch = useDispatch();

    function handlePrev() {
        if (hasPrev) {
            const navPrev: NavPrevPuzzler = {
                type: Type.NAV_PREV_PUZZLER,
            };
            dispatch(navPrev);
        }
    }

    const active = hasPrev ? 'active' : '';
    return <div onClick={ handlePrev } className={ `nav-puzzlers ${ active } prev` }/>;
}

function NextButton() {
    const hasNext = useSelector((st: State) => st.current > 0);
    const answer = useSelector((st: State) => st.puzzlers[st.current]?.answer);
    const dispatch = useDispatch();

    function handleNext() {
        if (hasNext) {
            const navNext: NavNextPuzzler = {
                type: Type.NAV_NEXT_PUZZLER,
            };
            dispatch(navNext);
        } else if (answer) {
            const loadNext: LoadNextPuzzler = {
                type: Type.LOAD_NEXT_PUZZLER,
            };
            dispatch(loadNext);
        } else {
            throw new Error('Cannot dispatch');
        }
    }

    const active = (hasNext || answer) ? 'active' : '';
    return <div onClick={ handleNext } className={ `nav-puzzlers ${ active } next` } />;
}

function Choices(): ReactElement {
    const id = useSelector((st: State) => st.puzzlers[st.current]?.id);
    const choicesCount = useSelector((st: State) => st.puzzlers[st.current]?.choiceCodes.length);
    return <>{
        id && choicesCount &&
        R.range(0, choicesCount)
            .map((choice: number) =>
                <Choice
                    key={ id + '_' + choice }
                    choice={ choice }
                />
            )
    }</>
}

function Choice(p: {choice: number}): ReactElement {
    const puzzlerId = useSelector((st: State) => st.puzzlers[st.current]?.id);
    const token = useSelector((st: State) => st.puzzlers[st.current]?.token);

    const choiceCode = useSelector((st: State) => st.puzzlers[st.current]?.choiceCodes[p.choice]);
    const answer = useSelector((st: State) => st.puzzlers[st.current]?.answer);

    const highlight = (() => {
        if (answer?.correctChoice === p.choice) {
            return 'correct';
        }
        if (answer?.userChoice === p.choice) {
            return 'incorrect';
        }
        return '';
    })();
    const outline = (() => {
        if (answer?.userChoice === p.choice) {
            return 'user-choice';
        }
        return '';
    })();

    const dispatch = useDispatch();

    function handleClick() {
        if (!answer) {
            const checkChoice: CheckChoice = {
                type: Type.CHECK_CHOICE,
                puzzlerId,
                token,
                choice: p.choice,
            };
            dispatch(checkChoice);
        }
    }

    const active = answer ? '' : 'active';
    return <div className={ `choice ${ highlight } ${ outline } ${ active }` }
                onClick={ handleClick }>{
        choiceCode &&
        choiceCode.map(
            (regions, i) =>
                <Line key={ i } regions={ regions } />
        )
    }</div>;
}

function Line(p: {regions: Region[]}) {
    const className = (region: Region) => region.differing
        ? region.kind + ' differing'
        : region.kind;

    return <pre>{
        p.regions.map((region: Region, i) =>
            <span key={ i } className={ className(region) }>{ region.text }</span>
        )
    }</pre>
}
