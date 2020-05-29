import React, { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { State } from '../redux/store';
import { Lines } from './lines';

export function Body(): ReactElement {
    const bodyInnerCode = useSelector((state: State) => state.puzzlerViews.get(state.current).getOrUndefined()?.bodyInnerCode);
    return <div className='code'>
        <Lines lines={ bodyInnerCode } />
    </div>;
}
