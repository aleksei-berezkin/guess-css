import React from 'react';
import { createRoot } from 'react-dom/client';
import { PuzzlerApp } from './ui/puzzlerApp';


const container = document.getElementById('app-root-div')!
const root = createRoot(container)
root.render(<PuzzlerApp basename={ getBasename() }/>)

function getBasename() {
    return location.host.includes('github') ? '/guess-css-site' : undefined;
}
