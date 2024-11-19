/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

// No way so far to render React app as ESM without changing all import statements

require('./out/ssr/entry-server.js').render('/', __dirname)
