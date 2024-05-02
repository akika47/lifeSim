let pieceButtonDisabled = document.getElementById("pieceButton");
let startButtonDisabled = document.getElementById("startButton");
let columnSlider = document.getElementById("columnCount");
let rowSlider = document.getElementById("rowCount");
let pieceCountSlider = document.getElementById("pieceCount");
let gameTable = document.getElementById("game");
let statisticsDiv = document.getElementById("statistics");
let table = [];
let piecesPlaced = 0;

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

        gameTable.appendChild(cell);
    }

    let cellList = document.querySelectorAll(".cell");

    let piecesPlaced = 0;
    while (piecesPlaced < pieceCount) {
        let randomIndex = Math.floor(Math.random() * cellCount);
        if (!occupiedTiles.has(randomIndex)) {
            cellList[randomIndex].classList.add("piece");
            cellList[randomIndex].innerText = "♟︎";
            cellList[randomIndex].dataset.pieceId = piecesPlaced++;
            occupiedTiles.add(randomIndex);
        }
    }

    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        let randomIndex = Math.floor(Math.random() * cellCount);
        if (!occupiedTiles.has(randomIndex)) {
            cellList[randomIndex].classList.add("mine");
            minesPlaced++
            occupiedTiles.add(randomIndex);
        }
    }


    gameTable.style.setProperty('grid-template-columns', 'repeat(' + columnCount + ', 50px)');
    gameTable.style.setProperty('grid-template-rows', 'repeat(' + rowCount + ', 50px)');

    pieceButtonDisabled.disabled = true;
    startButtonDisabled.disabled = false;
}

let gameInterval;
let pieceLog = {};

function startGame() {
    gameInterval = setInterval(startMoving, 1000);
    statisticsDiv.innerText = ""
    startButton.disabled = true;
}
let cellData = {};
let lastMove = {};

function startMoving() {
    let pieces = document.querySelectorAll('.piece');

    pieces.forEach(piece => {
        let cellIndex = Array.from(piece.parentNode.children).indexOf(piece);
        let rowSize = parseInt(rowSlider.value);
        let columnSize = parseInt(columnSlider.value);
        let directions = [];

        if (cellIndex >= columnSize && lastMove[piece.dataset.pieceId] !== 'bottom') {
            directions.push('top');
        }
        if (cellIndex < (rowSize - 1) * columnSize && lastMove[piece.dataset.pieceId] !== 'top') {
            directions.push('bottom');
        }
        if (cellIndex % columnSize !== 0 && lastMove[piece.dataset.pieceId] !== 'right') {
            directions.push('left');
        }
        if (cellIndex % columnSize !== columnSize - 1 && lastMove[piece.dataset.pieceId] !== 'left') {
            directions.push('right');
        }

        directions = directions.filter(direction => {
            let nextCell = getNextCell(piece, direction);
            return nextCell && !nextCell.classList.contains('mine');
        });

        if (directions.length > 0) {
            let preferredDirection = directions[Math.floor(Math.random() * directions.length)];
            lastMove[piece.dataset.pieceId] = preferredDirection;

            let nextCell = getNextCell(piece, preferredDirection);
            if (nextCell) {
                let nextCellIndex = Array.from(nextCell.parentNode.children).indexOf(nextCell);
                if (!cellData[nextCellIndex]) {
                    cellData[nextCellIndex] = { steps: 1 };
                } else {
                    cellData[nextCellIndex].steps++;
                }
                if (cellData[nextCellIndex].steps >= 10) {
                    nextCell.classList.add('mine')
                    piece.classList.remove('piece');
                    piece.innerText = "";
                }
            }

            movePiece(piece, nextCell);
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

function getNextCell(piece, direction) {
    let cellIndex = Array.from(piece.parentNode.children).indexOf(piece);
    let rowSize = parseInt(rowSlider.value);
    let columnSize = parseInt(columnSlider.value);
    let nextIndex;

    switch (direction) {
        case 'top':
            nextIndex = cellIndex - columnSize;
            break;
        case 'bottom':
            nextIndex = cellIndex + columnSize;
            break;
        case 'left':
            nextIndex = cellIndex - 1;
            break;
        case 'right':
            nextIndex = cellIndex + 1;
            break;
    }

    if (nextIndex >= 0 && nextIndex < rowSize * columnSize) {
        return piece.parentNode.children[nextIndex];
    } else {
        return null;
    }
}

function movePiece(piece, destination) {
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
        const sortedPieceLog = Object.entries(pieceLog).sort((a, b) => b[1].steps - a[1].steps);

        for (let [pieceId, data] of sortedPieceLog) {
            statisticsDiv.innerText += `Piece ID: ${pieceId}, Steps: ${data.steps}\n`;
        }
    } else {
        console.error("Statistics div not found.");
    }
}
