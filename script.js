let pieceButtonDisabled = document.getElementById("pieceButton");
let startButtonDisabled = document.getElementById("startButton");
let columnSlider = document.getElementById("columnCount");
let rowSlider = document.getElementById("rowCount");
let pieceCountSlider = document.getElementById("pieceCount");
let gameTable = document.getElementById("game");
let statisticsDiv = document.getElementById("statistics");
let table = [];
let piecesPlaced = 0;

const directions = [
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 },  // right
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 }   // down
];

function rangeValueChange() {
    let columnCount = parseInt(columnSlider.value);
    let rowCount = parseInt(rowSlider.value);
    pieceCountSlider.max = columnCount * rowCount * 0.5;
    let pieceCount = parseInt(pieceCountSlider.value);
    document.getElementById("columnRangeValue").innerText = columnCount;
    document.getElementById("rowRangeValue").innerText = rowCount;
    document.getElementById("pieceRangeValue").innerText = pieceCount;
}

function generateTable() {
    gameTable.innerText = "";
    let columnCount = parseInt(columnSlider.value);
    let rowCount = parseInt(rowSlider.value);
    let cellCount = columnCount * rowCount;
    let pieceCount = parseInt(pieceCountSlider.value);
    let mineCount = Math.floor(cellCount / 10);

    let occupiedTiles = new Set();

    gameTable.innerHTML = "";

    for (let i = 0; i < cellCount; i++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");

        if (pieceCount > 0 && !occupiedTiles.has(i) && Math.random() < 0.5) {
            cell.classList.add("piece");
            cell.innerText = "O";
            cell.dataset.pieceId = piecesPlaced++;
            pieceCount--;
            occupiedTiles.add(i);
        }

        if (mineCount > 0 && !occupiedTiles.has(i) && Math.random() < 0.1) {
            cell.classList.add("mine");
            mineCount--;
            occupiedTiles.add(i);
        }

        gameTable.appendChild(cell);
    }

    gameTable.style.setProperty('grid-template-columns', 'repeat(' + columnCount + ', 50px)');
    gameTable.style.setProperty('grid-template-rows', 'repeat(' + rowCount + ', 50px)');

    pieceButtonDisabled.disabled = true;
    startButtonDisabled.disabled = false;
}

let gameInterval;
let pieceLog = {};

function startGame() {
    gameInterval = setInterval(startMoving, 10);
    statisticsDiv.innerText = ""
    startButton.disabled = true;
}

function startMoving() {
    let pieces = document.querySelectorAll('.piece');

    pieces.forEach(piece => {
        let cellIndex = Array.from(piece.parentNode.children).indexOf(piece);
        let rowSize = parseInt(rowSlider.value);
        let columnSize = parseInt(columnSlider.value);
        let directions = [];

        if (cellIndex >= columnSize) {
            directions.push('top');
        }
        if (cellIndex < (rowSize - 1) * columnSize) {
            directions.push('bottom');
        }
        if (cellIndex % columnSize !== 0) {
            directions.push('left');
        }
        if (cellIndex % columnSize !== columnSize - 1) {
            directions.push('right');
        }

        if (directions.length > 0) {
            let randomDirection = directions[Math.floor(Math.random() * directions.length)];
            switch (randomDirection) {
                case 'top':
                    movePiece(piece, piece.parentNode.children[cellIndex - columnSize]);
                    break;
                case 'bottom':
                    movePiece(piece, piece.parentNode.children[cellIndex + columnSize]);
                    break;
                case 'left':
                    movePiece(piece, piece.parentNode.children[cellIndex - 1]);
                    break;
                case 'right':
                    movePiece(piece, piece.parentNode.children[cellIndex + 1]);
                    break;
            }
        } else {
            recordPieceDeath(piece);
            piece.classList.remove('piece');
            piece.innerText = "";
        }
    });

    if (document.querySelectorAll('.piece').length === 0) {
        endGame();
    }
}

function movePiece(piece, destination) {
    if (!destination.classList.contains('mine')) {
        let tempText = destination.innerText;
        let tempClasses = destination.className;
        destination.innerText = piece.innerText;
        destination.className = piece.className;
        piece.innerText = tempText;
        piece.className = tempClasses;
        let pieceId = piece.dataset.pieceId;
        if (!pieceLog[pieceId]) {
            pieceLog[pieceId] = { steps: 0 };
        }
        pieceLog[pieceId].steps++;
    } else {
        recordPieceDeath(piece);
        piece.classList.remove('piece');
        piece.innerText = "";
    }
}

function recordPieceDeath(piece) {
    let pieceId = piece.dataset.pieceId;
    if (!pieceLog[pieceId]) {
        pieceLog[pieceId] = {
            steps: 0,
        };
    }
    pieceLog[pieceId].steps++;
}
function endGame() {
    clearInterval(gameInterval);
    pieceButtonDisabled.disabled = false;
    if (statisticsDiv) {
        statisticsDiv.innerText = "Piece Log:\n";
        delete pieceLog[Object.keys(pieceLog).pop()];
        for (let pieceId in pieceLog) {
            if (pieceLog.hasOwnProperty(pieceId)) {
                statisticsDiv.innerText += `Piece ID: ${pieceId}, Steps: ${pieceLog[pieceId].steps}\n`;
            }
        }
    } else {
        console.error("Statistics div not found.");
    }
}

