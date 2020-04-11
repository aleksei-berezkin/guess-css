import React, { ReactElement, useEffect } from 'react';
import { ChoiceCode, Region } from '../../shared/api';
import { getPuzzlerUrl } from '../clientApi';
import * as R from 'ramda';
import { useDispatch, useSelector } from 'react-redux';
import { Answer, State } from '../redux/store';
import { CheckChoice, LoadNextPuzzler, NavNextPuzzler, NavPrevPuzzler, Type } from '../redux/actions';
import { Dispatch } from 'redux';

export function Puzzler(): ReactElement {
    const initialized = useSelector((state: State) => !state.puzzlers.isEmpty());
    const dispatch: Dispatch<LoadNextPuzzler> = useDispatch();

    useEffect(() => {
        if (!initialized) {
            dispatch({
                type: Type.LOAD_NEXT_PUZZLER,
                diffHint: true,
            });
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
    const historyPuzzlerPos = useSelector((st: State) => st.puzzlers.length() - st.current);
    const donePuzzlersNum = useSelector(getDonePuzzlersNum);

    return <>{
        isHistory &&
        <div>Done puzzler: { historyPuzzlerPos } of { donePuzzlersNum }</div>
    }</>
}

function getDonePuzzlersNum(st: State) {
    if (st.puzzlers.isEmpty()) {
        return 0;
    }
    if (st.puzzlers.head().filter(p => p.answer != null).isSome()) {
        return st.puzzlers.length();
    }
    return st.puzzlers.length() - 1;
}

function LayoutFrame() {
    const [id, token] = useSelector((st: State) =>
        st.puzzlers.get(st.current)
            .map<[string?, string?]>(p => [p.id, p.token])
            .getOrElse([undefined, undefined])
    );

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
    const hasPrev = useSelector((st: State) => st.current < st.puzzlers.length() - 1);
    const dispatch: Dispatch<NavPrevPuzzler> = useDispatch();

    function handlePrev() {
        if (hasPrev) {
            dispatch({type: Type.NAV_PREV_PUZZLER});
        }
    }

    const active = hasPrev ? 'active' : '';
    return <div onClick={ handlePrev } className={ `nav-puzzlers ${ active } prev` }/>;
}

function NextButton() {
    const hasNext = useSelector((st: State) => st.current > 0);
    const answer = useSelector((st: State) => st.puzzlers.get(st.current).map(p => p.answer).getOrElse(undefined));
    const dispatch: Dispatch<NavNextPuzzler | LoadNextPuzzler> = useDispatch();

    function handleNext() {
        if (hasNext) {
            dispatch({type: Type.NAV_NEXT_PUZZLER});
        } else if (answer) {
            dispatch({
                type: Type.LOAD_NEXT_PUZZLER,
                diffHint: false,
            });
        } else {
            throw new Error('Cannot dispatch');
        }
    }

    const active = (hasNext || answer) ? 'active' : '';
    return <div onClick={ handleNext } className={ `nav-puzzlers ${ active } next` } />;
}

function Choices(): ReactElement {
    const [id, choicesCount] = useSelector((st: State) =>
        st.puzzlers.get(st.current)
            .map<[string?, number?]>(p => [p.id, p.choiceCodes.length])
            .getOrElse([undefined, undefined])
    );

    return <div className='choices'>{
        id && choicesCount &&
        R.range(0, choicesCount)
            .map((choice: number) =>
                <Choice
                    key={ id + '_' + choice }
                    choice={ choice }
                />
            )
    }</div>
}

function Choice(p: {choice: number}): ReactElement {
    const [puzzlerId, token, choiceCode, answer] = useSelector((st: State) =>
        st.puzzlers.get(st.current)
            .map<[string?, string?, ChoiceCode?, Answer?]>(puz => [puz.id, puz.token, puz.choiceCodes[p.choice], puz.answer])
            .getOrElse([undefined, undefined, undefined, undefined])
    );

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

    const dispatch: Dispatch<CheckChoice> = useDispatch();

    function handleClick() {
        if (!answer) {
            dispatch({
                type: Type.CHECK_CHOICE,
                puzzlerId: puzzlerId!,
                token: token!,
                choice: p.choice,
            });
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
    return <pre>{
        p.regions.map(
            (reg, i) => {
                const className = reg.differing
                    ? reg.kind + ' differing'
                    : reg.kind;

                const style = reg.backgroundColor
                    ? {backgroundColor: reg.backgroundColor}
                    : undefined;

                return <span key={ i } className={ className } style={ style }>{ reg.text }</span>;
            }
        )
    }</pre>
}
