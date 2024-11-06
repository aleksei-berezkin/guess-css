import { ScrollToTop } from './scrollToTop';
import React from 'react';

export function PuzzlerAppBody(p: {children: React.ReactNode}) {
    return <>
        <ScrollToTop />
        {
            p.children
        }
    </>
}
