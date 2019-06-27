🎮 react-tic-tac-toe
====================

This repo is an exercise in learning the basics of React.

The basis of this is the [Tic Tac Toe tutorial found on React's website](https://reactjs.org/tutorial/tutorial.html).

Everything has been converted to use [TypeScript](https://www.typescriptlang.org).

The features of the tutorial app have been expanded with the optional exercises from the end of the [tutorial](https://reactjs.org/tutorial/tutorial.html#wrapping-up).

There are subdirectories containing differing implementations of the app:

- `orig/` - This is the original app, plus my take on implementing the optional exercises at the end.
- `hooks/` - This is the original app modified to use [React Hooks](https://reactjs.org/docs/hooks-intro.html) instead
   of a mix of function and component classes.
- `ssr/`  - This is the `hooks` app from above modified to use
   [React's Server-Side Rendering](https://reactjs.org/docs/react-dom-server.html) and _no client-side JavaScript_.
   The server stores game states using a session token and the client POSTs using `<form>`s to make moves. 

📐 Setup
--------

1. Run `npm install` in the root directory of this repo.
2. Then run `tsc` to compile all the TypeScript files.

🚀 Running the Code
-------------------

### 🖥 Client-Side Examples

It's easiest to get the client-side-only examples running using [Parcel](https://parceljs.org/), so:

```
npm install -g parcel-bundler
```

And then in either the `orig/` or `hooks/` folder run:

```
parcel index.html
```

Which should start a server at [http://localhost:1234/](http://localhost:1234/).

### 🌎 Server-Side Examples

For `ssr/` make sure you have a [recent Node.js version](https://nodejs.org) installed (I used 10.16.0). And then run
this from the `ssr/` folder:

```
node server.js
```

The server will start at [http://localhost:3000](http://localhost:3000). Set the `PORT` environment variable to change the port used.

📄 License
----------

Substantial portions of this code is based on the [Tic Tac Toe tutorial found on React's website](https://reactjs.org/tutorial/tutorial.html),
so my additions to the code will be licensed [using the same license](https://github.com/reactjs/reactjs.org/blob/master/LICENSE-DOCS.md)
they used, which is the [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)
license.

See `LICENSE.md` for more details.