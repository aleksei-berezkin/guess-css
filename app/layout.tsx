import { PuzzlerApp } from './puzzlerApp'

export default function RootLayout(p: {children: React.ReactNode}) {
    return <html lang="en">
    <head>
        <meta httpEquiv="x-ua-compatible" content="ie=edge"/>
        <meta name="viewport" content="initial-scale=1, width=device-width"/>
        <title>Guess CSS! HTML & CSS puzzler game</title>
        <meta name="description" content="You are given a small frame, its HTML source and 3 CSS snippets. Guess which of them was used to style the frame, test your knowledge!"/>
        <link rel="shortcut icon" type="image/png" href="/css-logo.png"/>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <style id="loading-screen-style">
        </style>
    </head>
    <body>
         <div id='app-root-div'>
            <PuzzlerApp> { p.children } </PuzzlerApp>
         </div>
    </body>
</html>
}
