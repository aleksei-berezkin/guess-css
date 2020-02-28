import React, { ReactElement, useEffect, useState } from 'react';
import { Region } from '../../shared/api';
import { getPuzzlerUrl } from '../clientApi';
import * as R from 'ramda';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../redux/store';
import { CheckChoice, LoadNextPuzzler, Type } from '../redux/actions';

export function Puzzler(): ReactElement {
    const initialized = useSelector((state: State) => state.puzzlers.length > 0);
    useEffect(() => {
        if (!initialized) {
            loadNextPuzzler();
        }
    }, [initialized]);
    const dispatch = useDispatch();

    function loadNextPuzzler() {
        const loadAction: LoadNextPuzzler = {
            type: Type.LOAD_NEXT_PUZZLER,
        };
        dispatch(loadAction);
    }

    return <>
        <h1>Guess the code snippet which produces this layout</h1>
        <Score/>
        <LayoutFrame loadNextPuzzler={ loadNextPuzzler }/>
        <DiffHint/>
        <Choices/>
    </>
}

function Score() {
    const correct = useSelector((state: State) => state.score.correct);
    const total = useSelector((state: State) => state.score.total);
    return <div>Correct answers: { correct } of { total }</div>;
}

function LayoutFrame(p: {loadNextPuzzler: () => void}): ReactElement {
    const id = useSelector((st: State) => st.puzzlers[st.current]?.id);
    const token = useSelector((st: State) => st.puzzlers[st.current]?.token);
    return <div className='top-content'>
        <>{
            id && token &&
            <iframe className='puzzler-choice' src={ getPuzzlerUrl(id, token) }/>
        }</>
        <NextButton loadNextPuzzler={ p.loadNextPuzzler }/>
    </div>;
}

function NextButton(p: {loadNextPuzzler: () => void}) {
    const answer = useSelector((st: State) => st.puzzlers[st.current]?.answer);
    return <>{
        answer &&
        <div onClick={ p.loadNextPuzzler } className='next'/>
    }</>
}

function DiffHint(): ReactElement {
    const [diffHint, setDiffHint] = useState(true);
    return <>{
        diffHint &&
        <div style={ {margin: '10px'} }>Only fragments <b>in bold</b> differ { ' ' }
            <button type='button' onClick={ () => setDiffHint(false) }>Got it</button>
        </div>
    }</>;
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

    return <div className={ `choice ${ highlight } ${ outline }` } onClick={ handleClick }>{
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
