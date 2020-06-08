import React from 'react';
import { Region } from '../model/region';
import { stream } from '../stream/stream';

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
