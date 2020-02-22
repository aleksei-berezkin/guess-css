import React, { ReactElement, useEffect, useState } from 'react';
import { ChoiceFormatted, GenPuzzlerResponse, Region } from '../../shared/beans';
import { getPuzzlerUrl } from '../clientApi';
import * as R from 'ramda';
import { useDispatch, useSelector } from 'react-redux';
import { State } from '../redux/store';
import { LoadNextPuzzler, Type } from '../redux/actions';

export function Puzzler(): ReactElement {
    const puzzler = useSelector((state: State) => state.puzzler);
    const correctChoice = useSelector((state: State) => state.correctChoice);
    useEffect(() => {
        if (!puzzler) {
            loadNextPuzzler();
        }
    }, [puzzler]);
    const dispatch = useDispatch();

    function loadNextPuzzler() {
        const loadAction: LoadNextPuzzler = {
            type: Type.LOAD_NEXT_PUZZLER,
        };
        dispatch(loadAction);
    }

    return <>
        <h1>Guess the code snippet which produced the layout</h1>
        <LayoutFrame puzzler={ puzzler } correctChoice={ correctChoice }/>
        <DiffHint/>
        <Choices puzzler={ puzzler } correctChoice={ correctChoice }/>
        <button type='button'
                onClick={ loadNextPuzzler }
                style={{ display: 'block', width: '150px', height: '30px', marginTop: '20px' }}>
            Next
        </button>
    </>
}

function LayoutFrame(p: {puzzler: GenPuzzlerResponse | null, correctChoice: number | null}): ReactElement {
    return <>{
        p.puzzler && !R.isNil(p.correctChoice) &&
        <iframe className='puzzler-choice' src={ getPuzzlerUrl(p.puzzler, p.correctChoice) }/>
    }</>;
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

function Choices(p: {puzzler: GenPuzzlerResponse | null, correctChoice: number | null}): ReactElement {
    return <>{
        p.puzzler && !R.isNil(p.correctChoice) &&
        R.range(0, p.puzzler.choicesCount)
            .map((choice: number) =>
                <Choice
                    key={ p.puzzler!.id + '_' + choice }
                    choice={ choice }
                    correct={ choice === p.correctChoice }
                />
            )
    }</>
}

function Choice(p: {choice: number, correct: boolean}): ReactElement {
    const code: ChoiceFormatted = useSelector((state: State) => state.choices[p.choice]);

    function handleClick() {
        alert(p.correct ? 'Correct!' : 'Incorrect!');
    }

    return <div className='choice' onClick={ handleClick }>{
        code &&
        code.lines.map(
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
