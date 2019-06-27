import * as fs from "fs";
import * as url from "url";
import * as path from "path";
import * as http from "http";
import * as ReactDOMServer from "react-dom/server";
import * as React from "react";
import * as rollup from "rollup";
import * as commonjs from 'rollup-plugin-commonjs';
import * as nodeResolve from 'rollup-plugin-node-resolve';
import * as replace from 'rollup-plugin-replace';
import {Game} from "./tic-tac-toe";

const PORT = parseInt(process.env["PORT"] as string) || 3000;
const clientBundlePromise = (async () => {
    console.info("Creating client-side bundle...");

    let bundle = await rollup.rollup({
        input: 'client.js',
        plugins: [
            (nodeResolve as any)({
                mainFields: ['browser'],
                browser: true
            }),

            (commonjs as any)({
                sourceMap: false,
            }),

            (replace as any)({
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
        ]
    });

    let { output } = await bundle.generate({
        file: 'client.bundle.js',
        format: 'esm'
    });

    console.info("Done!");

    return output[0].code;
})();

const server = http.createServer(async (req, res) => {
    const urlParsed = url.parse(req.url as string);

    console.info(`[ ${new Date().toISOString()} ] ${urlParsed.pathname}`);

    if (urlParsed.pathname === "/") {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write("<!doctype html>");
        res.end(ReactDOMServer.renderToString(
            <html>
            <head>
                <title>Hello from ReactDOMServer!</title>
                <link rel="stylesheet" href="/index.css" type="text/css"/>
            </head>
            <body>
                <div id="root">
                    {React.createElement(Game)}
                </div>
                <script type="module" src="client.js" />
            </body>
            </html>
        ));
    } else if (urlParsed.pathname === "/index.css") {
        res.writeHead(200, { "Content-Type": "text/css" });
        res.end(fs.readFileSync(path.join(__dirname, "index.css")));
    } else if (urlParsed.pathname === "/client.js") {
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.end(await clientBundlePromise);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({status: "error", error: "404 Page Not Found."}))
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.info("Server is listening on http://localhost:" + PORT);
});