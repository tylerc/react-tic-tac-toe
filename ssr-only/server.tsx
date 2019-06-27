import * as fs from "fs";
import * as url from "url";
import * as path from "path";
import * as http from "http";
import * as crypto from "crypto";
import * as querystring from "querystring";
import * as ReactDOMServer from "react-dom/server";
import * as React from "react";
import {calculateWinner, Game, GameState} from "./tic-tac-toe";

const PORT = parseInt(process.env["PORT"] as string) || 3000;
let gameState: {[sessionToken: string]: GameState} = {};

function respondWithGameState(res: http.ServerResponse, gameState: GameState, sessionToken: string) {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write("<!doctype html>");
    res.end(ReactDOMServer.renderToStaticMarkup(
        <html>
        <head>
            <title>Hello from ReactDOMServer!</title>
            <link rel="stylesheet" href="/index.css" type="text/css"/>
        </head>
        <body>
            {React.createElement(Game, {
                ...gameState,
                onHistoryClicked: (move: number) => {
                    return "/history/click/" + move;
                },
                onSquareClicked: (i: number) => {
                    return "/square/click/" + i;
                },
                onMoveOrderClicked: () => {
                    return "/move-order/reverse";
                }
            })}
        </body>
        </html>
    ).replace(/SERVER_SESSION_TOKEN/g, sessionToken));
}

const server = http.createServer(async (req, res) => {
    const urlParsed = url.parse(req.url as string);

    console.info(`[ ${new Date().toISOString()} ] ${urlParsed.pathname}`);

    let postBody: string = "";
    let postBodyParsed: any = {};

    if (req.method === "POST") {
        await new Promise((resolve) => {
            let chunks: Buffer[] = [];

            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => {
                postBody = Buffer.concat(chunks).toString();
                resolve();
            })
        });

        postBodyParsed = querystring.parse(postBody);

        if (postBodyParsed.sessionToken && !gameState[postBodyParsed.sessionToken]) {
            res.writeHead(302, {
                "Content-Type": "text/plain",
                "Location": "/"
            });
            res.end("Redirecting you to / ...");
        }
    }

    if (urlParsed.pathname === "/") {
        let sessionToken = crypto.randomBytes(32).toString('hex');
        gameState[sessionToken] = {
            history: [{
                squares: new Array(9).fill(null)
            }],
            stepNumber: 0,
            xIsNext: true,
            moveOrder: 'ascending'
        };

        respondWithGameState(res, gameState[sessionToken], sessionToken);
    } else if (/^\/session\/([a-f0-9]+)$/.test(urlParsed.pathname as string)) {
        let result = /^\/session\/([a-f0-9]+)$/.exec(urlParsed.pathname as string);

        if (!result) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({status: "error", error: "Expected to find session token but found none."}));
            return;
        }

        const sessionToken = result[1];
        const state = gameState[sessionToken] as GameState;
        if (!state) {
            res.writeHead(302, {
                "Content-Type": "text/plain",
                "Location": "/"
            });
            res.end("Redirecting you to / ...");
            return;
        }

        respondWithGameState(res, state, sessionToken);
    } else if (/^\/history\/click\/(\d+)$/.test(urlParsed.pathname as string)) {
        const state = gameState[postBodyParsed.sessionToken] as GameState;
        if (!state) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({status: "error", error: "Expected to find game state but found none."}));
            return;
        }

        let result = /^\/history\/click\/(\d+)$/.exec(urlParsed.pathname as string);
        if (!result) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({status: "error", error: "stepNumber must be a number."}));
            return;
        }

        let stepNumber = parseInt(result[1]);

        if (isNaN(stepNumber) || stepNumber < 0 || stepNumber >= state.history.length) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({status: "error", error: "stepNumber value was outside acceptable range."}));
            return;
        }

        gameState[postBodyParsed.sessionToken] = {
            ...state,
            stepNumber: stepNumber,
            xIsNext: (stepNumber % 2) === 0
        };

        res.writeHead(302, {
            "Content-Type": "text/plain",
            "Location": "/session/" + postBodyParsed.sessionToken
        });
        res.end("Redirecting you to / ...");
    } else if (/^\/square\/click\/(\d+)$/.test(urlParsed.pathname as string)) {
        const state = gameState[postBodyParsed.sessionToken] as GameState;
        if (!state) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({status: "error", error: "Expected to find game state but found none."}));
            return;
        }

        let result = /^\/square\/click\/(\d+)$/.exec(urlParsed.pathname as string);
        if (!result) {
            res.writeHead(400, {"Content-Type": "application/json"});
            res.end(JSON.stringify({status: "error", error: "square must be a number."}));
            return;
        }

        let square = parseInt(result[1]);

        if (isNaN(square) || square < 0 || square >= state.history[0].squares.length) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({status: "error", error: "square value was outside acceptable range."}));
            return;
        }

        const {history, stepNumber, xIsNext} = state;

        const truncatedHistory = history.slice(0, stepNumber + 1);
        const current = truncatedHistory[truncatedHistory.length - 1];
        const squares = current.squares.slice();
        if (!calculateWinner(squares).winningSide && !squares[square]) {
            squares[square] = xIsNext ? 'X' : "O";

            gameState[postBodyParsed.sessionToken] = {
                ...state,
                history: (truncatedHistory.concat([{
                    squares: squares
                }])),
                stepNumber: truncatedHistory.length,
                xIsNext: !xIsNext
            };
        } else {
            // Either someone won, or something was already placed here, so do nothing.
        }

        res.writeHead(302, {
            "Content-Type": "text/plain",
            "Location": "/session/" + postBodyParsed.sessionToken
        });
        res.end("Redirecting you to / ...");
    } else if (urlParsed.pathname === "/move-order/reverse") {
        const state = gameState[postBodyParsed.sessionToken] as GameState;
        if (!state) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({status: "error", error: "Expected to find game state but found none."}));
            return;
        }

        gameState[postBodyParsed.sessionToken] = {
            ...state,
            moveOrder: state.moveOrder === "ascending" ? "descending" : "ascending"
        };

        res.writeHead(302, {
            "Content-Type": "text/plain",
            "Location": "/session/" + postBodyParsed.sessionToken
        });
        res.end("Redirecting you to / ...");
    } else if (urlParsed.pathname === "/index.css") {
        res.writeHead(200, { "Content-Type": "text/css" });
        res.end(fs.readFileSync(path.join(__dirname, "index.css")));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({status: "error", error: "404 Page Not Found."}))
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.info("Server is listening on http://localhost:" + PORT);
});