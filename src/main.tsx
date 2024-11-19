import React from 'react'
import { createRoot } from 'react-dom/client'
import { PuzzlerApp } from './puzzlerApp'

if (Math.random() < 0) console.log(React)

    createRoot(document.getElementById('app-root-div')!).render(
    <PuzzlerApp />
)
