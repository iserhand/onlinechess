//UI
var modal = document.getElementById('myModal');
var span = document.getElementsByClassName('close')[0];
span.onclick = function () {
	modal.style.display = 'none';
};
let myInterval;
//Setup board screen
const blackTimerText = document.getElementById('blackTimer');
const whiteTimerText = document.getElementById('whiteTimer');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const boardcanvas = document.getElementById('board');
const boardctx = boardcanvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const SQUARE_SIZE = CANVAS_WIDTH / 8;
const HIGHLIGHT_COLOR = 'rgba(50, 168, 68, 0.2)';
var userTypeString = 's';
let board = [
	['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
	['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
	['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'],
];
const loadImage = (src) =>
	new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.draggable = true;
		img.src = src;
	});
function drawBoard() {
	ctx.clearRect(0, 0, CANVAS_HEIGHT, CANVAS_WIDTH);
	boardctx.clearRect(0, 0, CANVAS_HEIGHT, CANVAS_WIDTH);
	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			if ((i + j) % 2 == 0) {
				if (userTypeString === 'b') {
					boardctx.fillStyle = 'rgba(138, 114, 34,1)';
				} else {
					boardctx.fillStyle = 'rgba(230, 226, 204,1)';
				}
			} else {
				if (userTypeString === 'b') {
					boardctx.fillStyle = 'rgba(230, 226, 204,1)';
				} else {
					boardctx.fillStyle = 'rgba(138, 114, 34,1)';
				}
			}
			boardctx.fillRect(j * SQUARE_SIZE, i * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
			if (board[i][j] == '') {
				continue;
			}
			loadImage('images/' + board[i][j] + '.png').then((image) => {
				ctx.drawImage(image, j * SQUARE_SIZE + 5, i * SQUARE_SIZE + 4);
			});
		}
	}
}

//Game Variables
let firstMove = true;
let blackCastle = [true, true];
let whiteCastle = [true, true];
let turn = 'black';
let blackTime = 600;
let whiteTime = 600;
let selectedx = -1;
let selectedy = -1;
let enPassantx = -1;
let enPassanty = -1;
let availableMoves = [];
let legalMoves = [
	[false, false, false, false, false, false, false, false],
	[false, false, false, false, false, false, false, false],
	[false, false, false, false, false, false, false, false],
	[false, false, false, false, false, false, false, false],
	[false, false, false, false, false, false, false, false],
	[false, false, false, false, false, false, false, false],
	[false, false, false, false, false, false, false, false],
	[false, false, false, false, false, false, false, false],
];
canvas.addEventListener('click', function (event) {
	if (userTypeString === 's') {
		return;
	}
	if (
		legalMoves[Math.floor(event.offsetY / SQUARE_SIZE)][Math.floor(event.offsetX / SQUARE_SIZE)]
	) {
		//Can make the move.
		var selectedPiece = board[selectedx][selectedy];
		if (
			selectedPiece.charAt(1) == 'p' &&
			Math.abs(selectedx - Math.floor(event.offsetY / SQUARE_SIZE)) == 2
		) {
			if (selectedPiece.charAt(0) == 'b') {
				enPassantx = Math.floor(event.offsetY / SQUARE_SIZE) - 1;
			} else {
				enPassantx = Math.floor(event.offsetY / SQUARE_SIZE) + 1;
			}
			enPassanty = Math.floor(event.offsetX / SQUARE_SIZE);
		}
		move(Math.floor(event.offsetY / SQUARE_SIZE), Math.floor(event.offsetX / SQUARE_SIZE));
		selectedx = -1;
		selectedy = -1;
		return;
	}
	if (
		selectedx == Math.floor(event.offsetY / SQUARE_SIZE) &&
		selectedy == Math.floor(event.offsetX / SQUARE_SIZE)
	) {
		//Clear highlighted area
		clearHighlights();
		selectedx = -1;
		selectedy = -1;
		return;
	}
	if (
		(selectedx >= 0 && Math.floor(event.offsetY / SQUARE_SIZE) != selectedx) ||
		(selectedy >= 0 && Math.floor(event.offsetX / SQUARE_SIZE) != selectedy)
	) {
		//Clear
		clearHighlights();
	}
	selectedx = Math.floor(event.offsetY / SQUARE_SIZE);
	selectedy = Math.floor(event.offsetX / SQUARE_SIZE);
	if (
		(turn == 'white' &&
			board[selectedx][selectedy].charAt(0) == 'w' &&
			userTypeString === 'w') ||
		(turn == 'black' && board[selectedx][selectedy].charAt(0) == 'b' && userTypeString === 'b')
	) {
		calculateAvilableMoves();
		highlightLegalMoves();
	} else {
		selectedx = -1;
		selectedy = -1;
		return;
	}
});
function clearHighlights() {
	for (let i = 0; i < availableMoves.length; i++) {
		ctx.clearRect(
			availableMoves[i][1] * SQUARE_SIZE,
			availableMoves[i][0] * SQUARE_SIZE,
			SQUARE_SIZE,
			SQUARE_SIZE
		);
		if (board[availableMoves[i][0]][availableMoves[i][1]] != '') {
			drawsquare(availableMoves[i][0], availableMoves[i][1]);
		}
	}
	legalMoves = legalMoves = [
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
	];
	availableMoves = [];
}

function highlightLegalMoves() {
	//Highlight squares.
	for (let i = 0; i < availableMoves.length; i++) {
		ctx.fillStyle = HIGHLIGHT_COLOR;
		ctx.fillRect(
			availableMoves[i][1] * SQUARE_SIZE,
			availableMoves[i][0] * SQUARE_SIZE,
			SQUARE_SIZE,
			SQUARE_SIZE
		);
	}
}
function calculateAvilableMoves() {
	//Check legal moves based on the clicked piece.
	var selectedPiece = board[selectedx][selectedy];
	if (turn == 'white') {
		//White's turn
		switch (selectedPiece) {
			case 'wp': {
				//Pawn selected
				//Check if the pawn is at the initial state
				if (selectedx == 6) {
					//Can move once or twice
					for (let i = 1; i <= 2; i++) {
						if (board[selectedx - i][selectedy] == '') {
							//Direct move
							var availableMove = [selectedx - i, selectedy];
							availableMoves.push(availableMove);
							legalMoves[selectedx - i][selectedy] = true;
						} else {
							break;
						}
						//Can move
					}
				} else {
					//Can move only once
					if (board[selectedx - 1][selectedy] == '') {
						//Direct move
						var availableMove = [selectedx - 1, selectedy];
						availableMoves.push(availableMove);
						legalMoves[selectedx - 1][selectedy] = true;
					}
				}
				//Can take?
				if (board[selectedx - 1][selectedy - 1]?.charAt(0) == 'b') {
					var availableMove = [selectedx - 1, selectedy - 1];
					availableMoves.push(availableMove);
					legalMoves[selectedx - 1][selectedy - 1] = true;
				}
				if (board[selectedx - 1][selectedy + 1]?.charAt(0) == 'b') {
					var availableMove = [selectedx - 1, selectedy + 1];
					availableMoves.push(availableMove);
					legalMoves[selectedx - 1][selectedy + 1] = true;
				}
				if (enPassantx == selectedx - 1 && enPassanty == selectedy - 1) {
					var availableMove = [selectedx - 1, selectedy - 1];
					availableMoves.push(availableMove);
					legalMoves[selectedx - 1][selectedy - 1] = true;
				}
				if (enPassantx == selectedx - 1 && enPassanty == selectedy + 1) {
					var availableMove = [selectedx - 1, selectedy + 1];
					availableMoves.push(availableMove);
					legalMoves[selectedx - 1][selectedy + 1] = true;
				}
				break;
			}
			case 'wr': {
				rookMove();
				break;
			}
			case 'wn': {
				//Knight selected
				knightMove();
				break;
			}
			case 'wb': {
				//Bishop selected
				bishopMove();
				break;
			}
			case 'wq': {
				//Queen selected
				rookMove();
				bishopMove();
				break;
			}
			case 'wk': {
				//King selected
				kingMove();
				break;
			}
		}
	} else {
		//Black's turn
		switch (selectedPiece) {
			case 'bp': {
				//Pawn selected
				if (selectedx == 6) {
					//Can move once or twice
					for (let i = 1; i <= 2; i++) {
						if (board[selectedx - i][selectedy] == '') {
							var availableMove = [selectedx - i, selectedy];
							availableMoves.push(availableMove);
							legalMoves[selectedx - i][selectedy] = true;
						} else {
							break;
						}
						//Can move
					}
				} else {
					//Can move only once
					if (board[selectedx - 1][selectedy] == '') {
						var availableMove = [selectedx - 1, selectedy];
						availableMoves.push(availableMove);
						legalMoves[selectedx - 1][selectedy] = true;
					}
				}
				//Can take?
				if (board[selectedx + 1][selectedy - 1]?.charAt(0) == 'w') {
					var availableMove = [selectedx + 1, selectedy - 1];
					availableMoves.push(availableMove);
					legalMoves[selectedx + 1][selectedy - 1] = true;
				}
				if (board[selectedx + 1][selectedy + 1]?.charAt(0) == 'w') {
					var availableMove = [selectedx + 1, selectedy + 1];
					availableMoves.push(availableMove);
					legalMoves[selectedx + 1][selectedy + 1] = true;
				}
				if (enPassantx == selectedx + 1 && enPassanty == selectedy - 1) {
					var availableMove = [selectedx + 1, selectedy - 1];
					availableMoves.push(availableMove);
					legalMoves[selectedx + 1][selectedy - 1] = true;
				}
				if (enPassantx == selectedx + 1 && enPassanty == selectedy + 1) {
					var availableMove = [selectedx + 1, selectedy + 1];
					availableMoves.push(availableMove);
					legalMoves[selectedx + 1][selectedy + 1] = true;
				}
				break;
			}

			case 'br': {
				rookMove();
				break;
			}
			case 'bn': {
				//Knight selected
				knightMove();
				break;
			}
			case 'bb': {
				//Bishop selected
				bishopMove();
				break;
			}
			case 'bq': {
				//Queen selected
				rookMove();
				bishopMove();
				console.log(legalMoves);
				break;
			}
			case 'bk': {
				//King selected
				kingMove();
				break;
			}
		}
	}
}
function move(x, y) {
	if (enPassantx == x && enPassanty == y) {
		var audio = new Audio('sounds/capture.mp3');
		audio.play();
		ctx.fillStyle = 'red';
		ctx.fillRect(enPassanty * SQUARE_SIZE, enPassantx * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
	} else {
		if (firstMove) {
			var audio = new Audio('sounds/game-start.mp3');
			audio.play();
			firstMove = false;
			myInterval = setInterval(timer, 1000);
		} else {
			if (board[x][y] != '') {
				if (board[x][y].charAt(1) == 'k') {
					var audio = new Audio('sounds/game-end.mp3');
					audio.play();
					gameOver();
					return;
				}
				var audio = new Audio('sounds/capture.mp3');
				audio.play();
			} else {
				var audio = new Audio('sounds/move.mp3');
				audio.play();
			}
		}
	}

	if (turn == 'white') {
		turn = 'black';
	} else {
		turn = 'white';
	}

	board[x][y] = board[selectedx][selectedy];
	board[selectedx][selectedy] = '';

	audio.play();
	drawsquare(x, y);
	drawsquare(selectedx, selectedy);
	clearHighlights();
}
function drawsquare(x, y) {
	ctx.clearRect(y * SQUARE_SIZE, x * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
	if (board[x][y] == '') {
		return;
	}
	loadImage('images/' + board[x][y] + '.png').then((image) => {
		ctx.drawImage(image, y * SQUARE_SIZE + 5, x * SQUARE_SIZE + 4);
	});
}
function timer() {
	if (turn == 'white') {
		whiteTime--;
		whiteTimerText.innerHTML =
			"White's Time=" +
			Math.floor(whiteTime / 60) +
			':' +
			(whiteTime % 60 < 10 ? '0' + (whiteTime % 60) : whiteTime % 60);
	} else {
		blackTime--;
		blackTimerText.innerHTML =
			"Black's Time=" +
			Math.floor(blackTime / 60) +
			':' +
			(blackTime % 60 < 10 ? '0' + (blackTime % 60) : blackTime % 60);
	}
}
function rookMove() {
	var up = true;
	var down = true;
	var left = true;
	var right = true;
	var opponent = 'b';
	if (turn == 'white') {
		opponent = 'b';
	} else {
		opponent = 'w';
	}
	//Rook selected
	for (let i = 1; i <= 7; i++) {
		if (up && selectedx - i >= 0) {
			if (board[selectedx - i][selectedy] == '') {
				var availableMove = [selectedx - i, selectedy];
				availableMoves.push(availableMove);
				legalMoves[selectedx - i][selectedy] = true;
			} else if (board[selectedx - i][selectedy]?.charAt(0) === opponent) {
				var availableMove = [selectedx - i, selectedy];
				availableMoves.push(availableMove);
				legalMoves[selectedx - i][selectedy] = true;
				up = false;
			} else {
				up = false;
			}
		}
		if (down && selectedx + i <= 7) {
			if (board[selectedx + i][selectedy] == '') {
				var availableMove = [selectedx + i, selectedy];
				availableMoves.push(availableMove);
				legalMoves[selectedx + i][selectedy] = true;
			} else if (board[selectedx + i][selectedy]?.charAt(0) === opponent) {
				var availableMove = [selectedx + i, selectedy];
				availableMoves.push(availableMove);
				legalMoves[selectedx + i][selectedy] = true;
				down = false;
			} else {
				down = false;
			}
		}
		if (left && selectedy - i >= 0) {
			if (board[selectedx][selectedy - i] == '') {
				var availableMove = [selectedx, selectedy - i];
				availableMoves.push(availableMove);
				legalMoves[selectedx][selectedy - i] = true;
			} else if (board[selectedx][selectedy - i]?.charAt(0) === opponent) {
				var availableMove = [selectedx, selectedy - i];
				availableMoves.push(availableMove);
				legalMoves[selectedx][selectedy - i] = true;
				left = false;
			} else {
				left = false;
			}
		}
		if (right && selectedy + i <= 7) {
			if (board[selectedx][selectedy + i] == '') {
				var availableMove = [selectedx, selectedy + i];
				availableMoves.push(availableMove);
				legalMoves[selectedx][selectedy + i] = true;
			} else if (board[selectedx][selectedy + i]?.charAt(0) === opponent) {
				var availableMove = [selectedx, selectedy + i];
				availableMoves.push(availableMove);
				legalMoves[selectedx][selectedy + i] = true;
				right = false;
			} else {
				right = false;
			}
		}
	}
}
function bishopMove() {
	var up = true;
	var down = true;
	var left = true;
	var right = true;
	var opponent = 'b';
	if (turn == 'white') {
		opponent = 'b';
	} else {
		opponent = 'w';
	}
	for (let i = 1; i <= 7; i++) {
		//Top Left
		if (up && selectedx - i >= 0 && selectedy - i >= 0) {
			if (board[selectedx - i][selectedy - i] == '') {
				var availableMove = [selectedx - i, selectedy - i];
				availableMoves.push(availableMove);
				legalMoves[selectedx - i][selectedy - i] = true;
			} else if (board[selectedx - i][selectedy - i]?.charAt(0) === opponent) {
				var availableMove = [selectedx - i, selectedy - i];
				availableMoves.push(availableMove);
				legalMoves[selectedx - i][selectedy - i] = true;
				up = false;
			} else {
				up = false;
			}
		}
		//Bottom left
		if (down && selectedx + i <= 7 && selectedy - i >= 0) {
			if (board[selectedx + i][selectedy - i] == '') {
				var availableMove = [selectedx + i, selectedy - i];
				availableMoves.push(availableMove);
				legalMoves[selectedx + i][selectedy - i] = true;
			} else if (board[selectedx + i][selectedy - i]?.charAt(0) === opponent) {
				var availableMove = [selectedx + i, selectedy - i];
				availableMoves.push(availableMove);
				legalMoves[selectedx + i][selectedy - i] = true;
				down = false;
			} else {
				down = false;
			}
		}
		//Top right
		if (left && selectedx - i >= 0 && selectedy + i <= 7) {
			if (board[selectedx - i][selectedy + i] == '') {
				var availableMove = [selectedx - i, selectedy + i];
				availableMoves.push(availableMove);
				legalMoves[selectedx - i][selectedy + i] = true;
			} else if (board[selectedx - i][selectedy + i]?.charAt(0) === opponent) {
				var availableMove = [selectedx - i, selectedy + i];
				availableMoves.push(availableMove);
				legalMoves[selectedx - i][selectedy + i] = true;
				left = false;
			} else {
				left = false;
			}
		}
		//Top left
		if (right && selectedx + i <= 7 && selectedy + i <= 7) {
			if (board[selectedx + i][selectedy + i] == '') {
				var availableMove = [selectedx + i, selectedy + i];
				availableMoves.push(availableMove);
				legalMoves[selectedx + i][selectedy + i] = true;
			} else if (board[selectedx + i][selectedy + i]?.charAt(0) === opponent) {
				var availableMove = [selectedx + i, selectedy + i];
				availableMoves.push(availableMove);
				legalMoves[selectedx + i][selectedy + i] = true;
				right = false;
			} else {
				right = false;
			}
		}
	}
}
function knightMove() {
	var opponent = 'b';
	if (turn == 'white') {
		opponent = 'b';
	} else {
		opponent = 'w';
	}
	var checkingSquaresx = [selectedx - 2, selectedx + 2];
	var checkingSquaresy = [selectedy - 1, selectedy + 1];
	var checkingSquaresxtwo = [selectedx - 1, selectedx + 1];
	var checkingSquaresytwo = [selectedy - 2, selectedy + 2];
	for (let i = 0; i < checkingSquaresx.length; i++) {
		for (let j = 0; j < checkingSquaresy.length; j++) {
			if (
				checkingSquaresx[i] >= 0 &&
				checkingSquaresx[i] <= 7 &&
				checkingSquaresy[j] <= 7 &&
				checkingSquaresy[j] >= 0
			) {
				if (
					board[checkingSquaresx[i]][checkingSquaresy[j]] === '' ||
					board[checkingSquaresx[i]][checkingSquaresy[j]]?.charAt(0) === opponent
				) {
					var availableMove = [checkingSquaresx[i], checkingSquaresy[j]];
					availableMoves.push(availableMove);
					legalMoves[checkingSquaresx[i]][checkingSquaresy[j]] = true;
				}
			}
			if (
				checkingSquaresxtwo[i] >= 0 &&
				checkingSquaresxtwo[i] <= 7 &&
				checkingSquaresytwo[j] <= 7 &&
				checkingSquaresxtwo[j] >= 0
			) {
				if (
					board[checkingSquaresxtwo[i]][checkingSquaresytwo[j]] === '' ||
					board[checkingSquaresxtwo[i]][checkingSquaresytwo[j]]?.charAt(0) === opponent
				) {
					var availableMove = [checkingSquaresxtwo[i], checkingSquaresytwo[j]];
					availableMoves.push(availableMove);
					legalMoves[checkingSquaresxtwo[i]][checkingSquaresytwo[j]] = true;
				}
			}
		}
	}
}
function kingMove() {
	var opponent = 'b';
	if (turn == 'white') {
		opponent = 'b';
	} else {
		opponent = 'w';
	}
	for (let i = selectedx - 1; i <= selectedx + 1; i++) {
		for (let j = selectedy - 1; j <= selectedy + 1; j++) {
			if (i >= 0 && i <= 7 && j >= 0 && j <= 7) {
				if (board[i][j] == '' || board[i][j].charAt(0) === opponent) {
					var availableMove = [i, j];
					availableMoves.push(availableMove);
					legalMoves[i][j] = true;
				}
			}
		}
	}
}
function castle(side) {}

function gameOver() {
	document.getElementById('winnerText').innerHTML = `Game over ${turn} wins`;
	modal.style.display = 'block';
	//Reset variables
	board = [
		['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
		['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
		['', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', ''],
		['', '', '', '', '', '', '', ''],
		['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
		['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'],
	];

	blackCastle = [true, true];
	whiteCastle = [true, true];
	turn = 'white';
	clearInterval(myInterval);
	blackTime = 600;
	whiteTime = 600;
	whiteTimerText.innerHTML =
		"White's Time=" +
		Math.floor(whiteTime / 60) +
		':' +
		(whiteTime % 60 == 0 ? '00' : whiteTime % 60);
	blackTimerText.innerHTML =
		"Black's Time=" +
		Math.floor(blackTime / 60) +
		':' +
		(blackTime % 60 == 0 ? '00' : blackTime % 60);
	firstMove = true;
	selectedx = -1;
	selectedy = -1;
	enPassantx = -1;
	enPassanty = -1;
	availableMoves = [];
	legalMoves = [
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
		[false, false, false, false, false, false, false, false],
	];
	drawBoard();
}

function isMate() {}
function isStaleMate() {}
