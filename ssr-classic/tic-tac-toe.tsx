import * as React from 'react';
import {useState} from "react";

type BoardArray = (string | null)[];
type HighlightArray = boolean[];

function Square(props: {value: string | null, onClick: () => any, highlight: boolean}) {
    return (
        <button className="square" onClick={props.onClick} style={{backgroundColor: props.highlight ? "yellow" : ""}}>
            {props.value}
        </button>
    );
}

function Board(props: {squares: BoardArray, highlights: HighlightArray, onClick: (square: number) => any}) {
    return (
        <div>
            {[0, 1, 2].map((_, row) => {
                return (
                    <div className="board-row" key={row}>
                        {[0, 1, 2].map((_, col) => {
                            let i = row * 3 + col;

                            return <Square key={i}
                                           value={props.squares[i]}
                                           highlight={props.highlights[i]}
                                           onClick={() => props.onClick(i)}
                            />;
                        })}
                    </div>
                )
            })}
        </div>
    );
}

export function Game() {
    const [history, setHistory] = useState([{
        squares: new Array(9).fill(null)
    }] as {squares: BoardArray}[]);
    const [stepNumber, setStepNumber] = useState(0);
    const [xIsNext, setXIsNext] = useState(true);
    const [moveOrder, setMoveOrder] = useState('ascending' as 'ascending' | 'descending');

    const current = history[stepNumber];
    const {winningSide, winningSquares} = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
        let desc = move ?
            'Go to move #' + move :
            'Go to game start';

        if (move > 0) {
            let previousHistory = history[move - 1];

            for (let i = 0; i < previousHistory.squares.length; i++) {
                const currentSquare = step.squares[i];
                const previousSquare = previousHistory.squares[i];

                if (currentSquare !== previousSquare) {
                    const column = i % 3;
                    const row = Math.floor(i / 3);
                    desc += ": " + currentSquare + " in (" + column + ", " + row + ")";
                }
            }
        }

        return (
            <li key={move}>
                <button style={{fontWeight: move === stepNumber ? "bold" : "normal"}}
                        onClick={() => {
                            setStepNumber(move);
                            setXIsNext((move % 2) === 0);
                        }}>
                    {desc}
                </button>
            </li>
        )
    });

    if (moveOrder === "descending") {
        moves.reverse();
    }

    const allSquaresFilled = current.squares.reduce((prev, curr) => (!!curr) && prev, true);

    let highlights = new Array(9).fill(false);

    let status;
    if (winningSide) {
        status = "Winner: " + winningSide;

        winningSquares.forEach((squareIndex) => highlights[squareIndex] = true);
    } else {
        if (allSquaresFilled) {
            status = "Draw!";
        } else {
            status = "Next player: " + (xIsNext ? "X" : "O");
        }
    }

    return (
        <div className="game">
            <div className="game-board">
                <Board
                    squares={current.squares}
                    onClick={(i) => {
                        const truncatedHistory = history.slice(0, stepNumber + 1);
                        const current = truncatedHistory[truncatedHistory.length - 1];
                        const squares = current.squares.slice();
                        if (calculateWinner(squares).winningSide || squares[i]) {
                            return;
                        }

                        squares[i] = xIsNext ? 'X' : "O";

                        setHistory(truncatedHistory.concat([{
                            squares: squares
                        }]));
                        setStepNumber(truncatedHistory.length);
                        setXIsNext(!xIsNext);
                    }}
                    highlights={highlights}
                />
            </div>
            <div className="game-info">
                <div>{status}</div>
                <ol>
                    {moves}
                    <li><button style={{background: "none", outline: 0, padding: 0, border: 0, cursor: "pointer", textDecoration: "underline", color: "blue"}}
                                onClick={() => {
                                    setMoveOrder(moveOrder === "ascending" ? "descending" : "ascending");
                                }}>reverse move order</button></li>
                </ol>
            </div>
        </div>
    );
}

// ========================================

function calculateWinner(squares: BoardArray): {winningSide: string | null, winningSquares: number[]} {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {winningSide: squares[a], winningSquares: lines[i]};
        }
    }

    return {winningSide: null, winningSquares: []};
}