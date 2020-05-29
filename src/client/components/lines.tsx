import React from 'react';
import { Vector } from 'prelude-ts';
import { Region } from '../model/region';

export function Lines(p: {lines: Vector<Region[]> | undefined}) {
    return <>{
        p.lines &&
        p.lines.zipWithIndex().map(
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
