import React, { ReactElement, useEffect } from 'react';
import { Region } from '../model/region';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../redux/store';
import {
    navNextPuzzler,
    navPrevPuzzler
} from '../redux/actions';
import { Dispatch } from 'redux';
import { range } from '../util';
import { Vector } from 'prelude-ts';
import { checkChoice, genNewPuzzler, initClient } from '../redux/thunks';

export function Puzzler(): ReactElement {
    const dispatch = useDispatch();

    useEffect(() => {dispatch(initClient())}, ['const']);

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
    const historyPuzzlerPos = useSelector((st: State) => st.puzzlerViews.length() - st.current);
    const donePuzzlersNum = useSelector(getDonePuzzlersNum);

    return <>{
        isHistory &&
        <div>Done puzzler: { historyPuzzlerPos } of { donePuzzlersNum }</div>
    }</>
}

function getDonePuzzlersNum(st: State) {
    if (st.puzzlerViews.isEmpty()) {
        return 0;
    }
    if (st.puzzlerViews.head().filter(p => p.userChoice != null).isSome()) {
        return st.puzzlerViews.length();
    }
    return st.puzzlerViews.length() - 1;
}

function LayoutFrame() {
    const source = useSelector((st: State) =>
        st.puzzlerViews.get(st.current)
            .map(p => p.source)
            .getOrUndefined()
    );

    return <div className='puzzler-top'>
        <PrevButton/>
        <>{
            source && <iframe className='layout' srcDoc={ source }/>
        }</>
        <NextButton/>
    </div>;
}

function PrevButton() {
    const hasPrev = useSelector((st: State) => st.current < st.puzzlerViews.length() - 1);
    const dispatch: Dispatch = useDispatch();

    function handlePrev() {
        if (hasPrev) {
            dispatch(navPrevPuzzler());
        }
    }

    const active = hasPrev ? 'active' : '';
    return <div onClick={ handlePrev } className={ `nav-puzzlers ${ active } prev` }/>;
}

function NextButton() {
    const hasNext = useSelector((st: State) => st.current > 0);
    const isAnswered = useSelector((st: State) => st.puzzlerViews.get(st.current).mapNullable(p => p.userChoice).isSome());
    const dispatch = useDispatch();

    function handleNext() {
        if (hasNext) {
            dispatch(navNextPuzzler());
        } else if (isAnswered) {
            dispatch(genNewPuzzler(false));
        } else {
            throw new Error('Cannot dispatch');
        }
    }

    const active = (hasNext || isAnswered) ? 'active' : '';
    return <div onClick={ handleNext } className={ `nav-puzzlers ${ active } next` } />;
}

function Choices(): ReactElement {
    const keyBase = useSelector((st: State) => `${st.current}_${st.puzzlerViews.length()}`);

    const choicesCount = useSelector((st: State) =>
        st.puzzlerViews.get(st.current)
            .map(p => p.choiceCodes.length())
            .getOrUndefined()
    );

    return <div className='choices'>{
        choicesCount &&
        range(0, choicesCount)
            .map((choice: number) =>
                <Choice
                    key={ `${keyBase}_${choice}` }
                    choice={ choice }
                />
            )
    }</div>
}

function Choice(p: {choice: number}): ReactElement {
    const [choiceCode, correctChoice, userChoice] = useSelector((st: State) =>
        st.puzzlerViews.get(st.current)
            .map<[Vector<Region[]>?, number?, number?]>(puz => [
                puz.choiceCodes.get(p.choice).getOrUndefined(),
                puz.correctChoice,
                puz.userChoice,
            ])
            .getOrElse([undefined, undefined, undefined])
    );

    const highlight = (() => {
        if (userChoice !== undefined && correctChoice === p.choice) {
            return 'correct';
        }
        if (userChoice === p.choice) {
            return 'incorrect';
        }
        return '';
    })();
    const outline = (() => {
        if (userChoice === p.choice) {
            return 'user-choice';
        }
        return '';
    })();

    const dispatch = useDispatch();

    function handleClick() {
        if (userChoice === undefined) {
            dispatch(checkChoice(p.choice));
        }
    }

    const active = userChoice === undefined ? 'active' : '';
    return <div className={ `choice ${ highlight } ${ outline } ${ active }` }
                onClick={ handleClick }>{
        choiceCode &&
        choiceCode.zipWithIndex().map(
            ([regions, i]) => <Line key={ i } regions={ regions } />
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
