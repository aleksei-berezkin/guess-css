import React, { ReactElement, useEffect, useState } from 'react';
import { ChoiceFormatted, GenPuzzlerResponse, Region } from '../../shared/beans';
import { fetchChoice, fetchGenPuzzler, getPuzzlerUrl } from '../clientApi';
import { randomBounded } from '../../shared/util';
import * as R from 'ramda';

interface State {
    gen: GenPuzzlerResponse,
    correctChoice: number,
    choices: {[i: number]: ChoiceFormatted},
}
export function Puzzler(): ReactElement {
    const [state, setState] = useState<State | null>(null);

    useEffect(() => {
        if (state) {
            return;
        }

        fetchGenPuzzler()
            .then(r => r.json())
            .then((r: GenPuzzlerResponse) => {
                setState({
                    gen: r,
                    correctChoice: randomBounded(r.choicesCount),
                    choices: {},
                });

                R.forEach<number>(
                    (choice: number) => {
                        fetchChoice(r.id, choice, r.token)
                            .then(r => r.json())
                            .then((r: ChoiceFormatted) => {
                                setState((prevState: State | null): State => {
                                    return {
                                        ...prevState!,
                                        choices: {
                                            ...prevState!.choices,
                                            [choice]: r,
                                        }
                                    };
                                });
                            });
                    }
                )(R.range(0, r.choicesCount));
            });
    }, [state]);

    return <>
        { state && <div><PuzzlerIFrame puzzler={ state.gen } correctChoice={ state.correctChoice }/></div> }
        {
            state &&
            R.map(
                (i: number) => <Choice key={ i } choice={ state!.choices[i] } correct={ i === state!.correctChoice }/>
            )(R.range(0, state.gen.choicesCount))
        }
    </>
}

function PuzzlerIFrame(props: {puzzler: GenPuzzlerResponse, correctChoice: number}): ReactElement {
    return <iframe className='puzzler-choice' src={ getPuzzlerUrl(props.puzzler.id, props.correctChoice, props.puzzler.token) }/>;
}

function Choice(p: {choice?: ChoiceFormatted, correct: boolean}): ReactElement {
    function handleClick() {
        alert(p.correct ? 'Correct!' : 'Incorrect!');
    }

    return <div className='choice' onClick={ handleClick }>
        {
            p.choice &&
            p.choice.lines.map((regions, i) => <Line key={ i } regions={ regions } />)
        }
    </div>;
}

function Line(p: {regions: Region[]}) {
    function getClassName(region: Region) {
        return region.differing
            ? region.kind + ' differing'
            : region.kind;
    }

    return <pre>
        {
            p.regions.map((region: Region, i) =>
                <span key={ i } className={ getClassName(region) }>{ region.text }</span>
            )
        }
    </pre>
}
