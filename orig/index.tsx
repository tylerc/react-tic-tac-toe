import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.css';

type BoardArray = (string | null)[];
type HighlightArray = boolean[];

function Square(props: {value: string | null, onClick: () => any, highlight: boolean}) {
    return (
        <button className="square" onClick={props.onClick} style={{backgroundColor: props.highlight ? "yellow" : ""}}>
            {props.value}
        </button>
    );
}

class Board extends React.Component<{squares: BoardArray, highlights: HighlightArray, onClick: (square: number) => any}> {
    // constructor(props: {squares: BoardArray}) {
    //     super(props);
    // }

    renderSquare(i: number) {
        return (
            <Square key={i}
                    value={this.props.squares[i]}
                    highlight={this.props.highlights[i]}
                    onClick={() => {
                        this.props.onClick(i)
                    }}
            />
        );
    }

    render() {
        return (
            <div>
                {[0, 1, 2].map((_, row) => {
                    return (
                        <div className="board-row" key={row}>
                            {[0, 1, 2].map((_, col) => {
                                return this.renderSquare(row * 3 + col);
                            })}
                        </div>
                    )
                })}
            </div>
        );
    }
}

class Game extends React.Component<{}, {
    history: {squares: BoardArray}[],
    stepNumber: number,
    xIsNext: boolean,
    moveOrder: 'ascending' | 'descending'
}> {
    constructor(props: {}) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            stepNumber: 0,
            xIsNext: true,
            moveOrder: 'ascending'
        }
    }

    handleClick(i: number) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares).winningSide || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : "O";
        this.setState({
            history: history.concat([{
                squares: squares
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step: number) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    handleMoveOrderClick() {
        this.setState({
            moveOrder: this.state.moveOrder === "ascending" ? "descending" : "ascending"
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const {winningSide, winningSquares} = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            let desc = move ?
                'Go to move #' + move :
                'Go to game start';

            if (move > 0) {
                let previousHistory = history[move - 1];

                for (let i = 0; i < previousHistory.squares.length; i++) {
                    let currentSquare = step.squares[i];
                    let previousSquare = previousHistory.squares[i];

                    if (currentSquare !== previousSquare) {
                        let column = i % 3;
                        let row = Math.floor(i / 3);
                        desc += ": " + currentSquare + " in (" + column + ", " + row + ")";
                    }
                }
            }

            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)} style={{fontWeight: move === this.state.stepNumber ? "bold" : "normal"}}>{desc}</button>
                </li>
            )
        });

        if (this.state.moveOrder === "descending") {
            moves.reverse();
        }

        let allSquaresFilled = current.squares.reduce((prev, curr) => (!!curr) && prev, true);

        let highlights = new Array(9).fill(false);

        let status;
        if (winningSide) {
            status = "Winner: " + winningSide;

            winningSquares.forEach((squareIndex) => highlights[squareIndex] = true);
        } else {
            if (allSquaresFilled) {
                status = "Draw!";
            } else {
                status = "Next player: " + (this.state.xIsNext ? "X" : "O");
            }
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        highlights={highlights}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>
                        {moves}
                        <li><button style={{background: "none", outline: 0, padding: 0, border: 0, cursor: "pointer", textDecoration: "underline", color: "blue"}} onClick={() => this.handleMoveOrderClick()}>reverse move order</button></li>
                    </ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

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