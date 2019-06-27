import * as fs from "fs";
import * as url from "url";
import * as path from "path";
import * as http from "http";
import * as querystring from "querystring";
import * as ReactDOMServer from "react-dom/server";
import * as React from "react";
import {calculateWinner, Game, GameState} from "./tic-tac-toe";
import * as iron from "@hapi/iron";

const PORT = parseInt(process.env["PORT"] as string) || 3000;
const ironGameStatePassword = "b+D37TLPxD38/iz2qQJYr8++qWotWirjmqfWzTEirgg=";
const gameStateExpectedVersion = 0;

function respondWithGameState(res: http.ServerResponse, gameState: GameState) {
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
                },
                onNewGameClicked: () => {
                    return "/new-game";
                }
            })}
        </body>
        </html>
    ));
}

async function redirectAfterAction(res: http.ServerResponse, gameState: GameState) {
    let sealed = await iron.seal(gameState, ironGameStatePassword, iron.defaults) + "; HttpOnly; Path=/";

    res.writeHead(302, {
        "Content-Type": "text/plain",
        "Location": "/",
        "Set-Cookie": "react_tic_tac_toe_game_state=" + sealed + "; HttpOnly; Path=/"
    });
    res.end("Redirecting you to / ...");
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
    }

    let gameState: GameState = {
        version: gameStateExpectedVersion,
        history: [{
            squares: new Array(9).fill(null)
        }],
        stepNumber: 0,
        xIsNext: true,
        moveOrder: 'ascending'
    };

    if (req.headers.cookie) {
        let result = /react_tic_tac_toe_game_state=([^;]+)(;|$)/.exec(req.headers.cookie);
        if (result && result[1]) {
            try {
                let unsealed: any = await iron.unseal(result[1], ironGameStatePassword, iron.defaults);
                if (unsealed && unsealed.version === gameStateExpectedVersion) {
                    gameState = unsealed;
                }
            } catch(e) {
                // Game state is either corrupted or for an old version. Do nothing.
                console.error("Unable to unseal gameState.", e);
            }
        }
    }

    if (urlParsed.pathname === "/") {
        respondWithGameState(res, gameState);
    } else if (/^\/history\/click\/(\d+)$/.test(urlParsed.pathname as string)) {
        let result = /^\/history\/click\/(\d+)$/.exec(urlParsed.pathname as string);
        if (!result) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({status: "error", error: "stepNumber must be a number."}));
            return;
        }

        let stepNumber = parseInt(result[1]);

        if (isNaN(stepNumber) || stepNumber < 0 || stepNumber >= gameState.history.length) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({status: "error", error: "stepNumber value was outside acceptable range."}));
            return;
        }

        gameState = {
            ...gameState,
            stepNumber: stepNumber,
            xIsNext: (stepNumber % 2) === 0
        };

        await redirectAfterAction(res, gameState);
    } else if (/^\/square\/click\/(\d+)$/.test(urlParsed.pathname as string)) {
        let result = /^\/square\/click\/(\d+)$/.exec(urlParsed.pathname as string);
        if (!result) {
            res.writeHead(400, {"Content-Type": "application/json"});
            res.end(JSON.stringify({status: "error", error: "square must be a number."}));
            return;
        }

        let square = parseInt(result[1]);

        if (isNaN(square) || square < 0 || square >= gameState.history[0].squares.length) {
            res.writeHead(400, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({status: "error", error: "square value was outside acceptable range."}));
            return;
        }

        const {history, stepNumber, xIsNext} = gameState;

        const truncatedHistory = history.slice(0, stepNumber + 1);
        const current = truncatedHistory[truncatedHistory.length - 1];
        const squares = current.squares.slice();
        if (!calculateWinner(squares).winningSide && !squares[square]) {
            squares[square] = xIsNext ? 'X' : "O";

            gameState = {
                ...gameState,
                history: (truncatedHistory.concat([{
                    squares: squares
                }])),
                stepNumber: truncatedHistory.length,
                xIsNext: !xIsNext
            };
        } else {
            // Either someone won, or something was already placed here, so do nothing.
        }

        await redirectAfterAction(res, gameState);
    } else if (urlParsed.pathname === "/move-order/reverse") {
        gameState = {
            ...gameState,
            moveOrder: gameState.moveOrder === "ascending" ? "descending" : "ascending"
        };

        await redirectAfterAction(res, gameState);
    } else if (urlParsed.pathname === "/new-game") {
        res.writeHead(302, {
            "Content-Type": "text/plain",
            "Location": "/",
            "Set-Cookie": "react_tic_tac_toe_game_state=deleted; HttpOnly; Expires=" + new Date(0).toUTCString() + "; Path=/"
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