🎮 react-tic-tac-toe
====================

React tic-tac-toe 🎮 with: TypeScript 💙, Hooks ⚓, and Server-Side Rendering 🖥!

This repo is an exercise in learning the basics of React.

The basis of this is the [Tic Tac Toe tutorial found on React's website](https://reactjs.org/tutorial/tutorial.html).

Everything has been converted to use [TypeScript](https://www.typescriptlang.org).

The features of the tutorial app have been expanded with the optional exercises from the end of the [tutorial](https://reactjs.org/tutorial/tutorial.html#wrapping-up).

There are subdirectories containing differing implementations of the app:

- `orig/` - This is the original app, plus my take on implementing the optional exercises at the end.
- `hooks/` - This is the original app modified to use [React Hooks](https://reactjs.org/docs/hooks-intro.html) instead
   of a mix of function and component classes.
- `ssr-classic/` - This is the `hooks` app from above modified to use [React's Server-Side Rendering](https://reactjs.org/docs/react-dom-server.html).
  "classic" because when most people say "server-side rendering" with React, they mean that the initial render is done
  by the server, and then React on the client-side takes it from there. Which is exactly what this example does.
  [Rollup](https://rollupjs.org) is called dynamically from the server to bundle the client-side assets.
- `ssr-only/`  - This is the `hooks` app from above modified to use
   [React's Server-Side Rendering](https://reactjs.org/docs/react-dom-server.html) and _no client-side JavaScript_.
   The server stores game states using a session token and the client POSTs using `<form>`s to make moves.
- `ssr-only-no-server-state/` - This is the `ssr-only/` app from above modified to store game state in a cookie so that
   no state needs to be stored on the server.
- `ssr-turbolinks/` - This is the `ssr-only-no-server-state/` app from above, modified to use [Turbolinks](https://github.com/turbolinks/turbolinks)
  in order to make loading feel a bit better. This breaks conventions a bit by changing the game state via `GET`
  requests, but the experience is a bit smoother.

 🌟 See it Live!
 ---------------
 
 The `ssr-only-no-server-state` example is running live at [https://react-tic-tac-toe.tylerc.now.sh](https://react-tic-tac-toe.tylerc.now.sh).

📐 Setup
--------

1. Clone this repo: https://github.com/tylerc/react-tic-tac-toe
2. Make sure you have a [recent Node.js version](https://nodejs.org) installed (I used 10.16.0).
3. Run `npm install` in the root directory of this repo.
4. Install TypeScript if you don't have it already: `npm install -g typescript`.
5. Then run `tsc` to compile all the TypeScript files.

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

For `ssr-classic/`, `ssr-only/`, `ssr-only-no-server-state/`, and `ssr-turbolinks/`, run this from within one of those
folders:

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