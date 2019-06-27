import * as ReactDOM from "react-dom";
import * as React from "react";
import {Game} from "./tic-tac-toe";

ReactDOM.hydrate(
    <Game />,
    document.getElementById('root')
);
