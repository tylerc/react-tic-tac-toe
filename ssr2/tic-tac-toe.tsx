import * as React from 'react';

export type BoardArray = (string | null)[];
export type HighlightArray = boolean[];
export interface GameState {
    version: number,
    history: {squares: BoardArray}[];
    stepNumber: number;
    xIsNext: boolean;
    moveOrder: 'ascending' | 'descending'
}

export function NinjaFormButton(props: {text: string | null, action: string, buttonClassName?: string, buttonStyle?: React.CSSProperties}) {
    return (
        <form method="POST" style={{display: "inline"}} action={props.action}>
            <button className={props.buttonClassName}
                    style={props.buttonStyle}
                    type="submit"
            >
                {props.text}
            </button>
        </form>
    )
}

export function Square(props: {value: string | null, action: string, highlight: boolean}) {
    return (
        <NinjaFormButton buttonStyle={{backgroundColor: props.highlight ? "yellow" : ""}}
                         buttonClassName="square"
                         text={props.value}
                         action={props.action} />
    );
}

export function Board(props: {squares: BoardArray, highlights: HighlightArray, onSquareClicked: (i: number) => string}) {
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
                                           action={props.onSquareClicked(i)}
                            />;
                        })}
                    </div>
                )
            })}
        </div>
    );
}

export function Game(
        {
            history, stepNumber, xIsNext, moveOrder,
            onHistoryClicked, onSquareClicked, onMoveOrderClicked, onNewGameClicked
        }: GameState &
        {
            onHistoryClicked: (move: number) => string,
            onSquareClicked: (i: number) => string,
            onMoveOrderClicked: () => string,
            onNewGameClicked: () => string
        }
) {
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
                <NinjaFormButton buttonStyle={{fontWeight: move === stepNumber ? "bold" : "normal"}}
                                 action={onHistoryClicked(move)}
                                 text={desc}
                />
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
                    highlights={highlights}
                    onSquareClicked={onSquareClicked}
                />
            </div>
            <div className="game-info">
                <div>{status}</div>
                <ol>
                    {moves}
                    <li><NinjaFormButton buttonStyle={{background: "none", outline: 0, padding: 0, border: 0, cursor: "pointer", textDecoration: "underline", color: "blue"}}
                                         text="reverse move order"
                                         action={onMoveOrderClicked()}
                    /></li>
                    <li><NinjaFormButton buttonStyle={{background: "none", outline: 0, padding: 0, border: 0, cursor: "pointer", textDecoration: "underline", color: "blue"}}
                                         text="start new game"
                                         action={onNewGameClicked()}
                    /></li>
                </ol>
            </div>
        </div>
    );
}

export function calculateWinner(squares: BoardArray): {winningSide: string | null, winningSquares: number[]} {
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
