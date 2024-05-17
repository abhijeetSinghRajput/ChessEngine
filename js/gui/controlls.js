const backdrop = document.querySelector('.backdrop');
const downloadWindow = backdrop.querySelector('.download-window');
const confirmWindow = backdrop.querySelector('.confirm-popover');

const downloadOptions = downloadWindow.querySelectorAll('.option>*');
const downloadBtn = downloadWindow.querySelector('.btn.download');

const confirmBtn = document.getElementById('confirm');
const cancelBtn = document.getElementById('cancel');
const gameOver = document.querySelector('.game-over');
const closeResult = gameOver.querySelector('.close');

const pgnOutput = downloadWindow.querySelector('.pgn textarea');
const fenOutput = downloadWindow.querySelector('.fen input');

document.addEventListener('mousedown', (e) => {
    if (!gameOver.contains(e.target)) {
        gameOver.classList.remove('active');
    }
});
gameOver.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        gameOver.classList.remove('active');
    })
})
closeResult.addEventListener('click', () => {
    gameOver.classList.remove('active');
})

function showConfirmWindow() {
    uploadPgnInput.value = '';
    confirmBtn.textContent = 'new game';
    backdrop.classList.add('active');
    confirmWindow.classList.add('active');
    downloadWindow.classList.remove('active');
}

function showDownloadWindow() {
    pgnOutput.value = getPGN();
    fenOutput.value = getFen();

    backdrop.classList.add('active');
    downloadWindow.classList.add('active');
    confirmWindow.classList.remove('active');
}

backdrop.addEventListener('click', (e) => {
    if (e.target.contains(backdrop)) {
        removeBackdrop();
    }
})

function removeBackdrop() {
    backdrop.classList.remove('active');
}

cancelBtn.addEventListener('click', () => {
    removeBackdrop();
})

confirmBtn.addEventListener('click', () => {
    removeBackdrop();
    if (uploadPgnInput.value) {
        try {
            parsePGN(uploadPgnInput.value);
        } catch (error) {
            alert(error);
        }
    }
    else {
        newGame();
    }
})

downloadOptions.forEach(option => {
    option.addEventListener('click', () => {
        downloadOptions.forEach(e => e.classList.remove('active'));
        option.classList.add('active');
        downloadFormate = option.textContent;
    })
})

let downloadFormate = 'PGN';
downloadBtn.addEventListener('click', () => {
    if (downloadFormate == 'PGN') {
        downloadPgn();
    }
    else if (downloadFormate == 'Image') {
        downloadImage();
    }
    removeBackdrop();
})

function downloadPgn() {
    let pgn = pgnOutput.value;
    if (pgn === '') return;

    const a = document.createElement('a');
    const blob = new Blob([pgn], { type: 'application/x-chess-pgn' });

    a.href = URL.createObjectURL(blob);
    a.download = 'game.pgn';

    a.click();
    a.remove();
}

function downloadImage() {
    html2canvas(graphicalBoard)
        .then(canvas => {
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/jpeg');
            a.download = 'game.jpg';

            a.click();
            a.remove();
        });
}

const coordinates = document.querySelectorAll('.coordinates *');
function flipBoard() {
    boardLayout.classList.toggle('flipped');
    flipCoordinates();
}
function flipCoordinates() {
    let texts = boardLayout.classList.contains('flipped') ? '12345678hgfedcba' : '87654321abcdefgh'
    for (let i = 0; i < coordinates.length; i++) {
        coordinates[i].textContent = texts[i];
    }
}



const uploadPgnBtn = document.getElementById('upload-pgn-btn');
const uploadPgnInput = document.getElementById('upload-pgn-input');
const fileInput = document.getElementById('file-input');

uploadPgnBtn.addEventListener('click', () => {
    fileInput.click();
})

uploadPgnInput.addEventListener('input', (e) => {
    confirmBtn.textContent = (uploadPgnInput.value)? 'load game' : 'new game';
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.addEventListener('load', (e) => {
            const pgn = e.target.result;
            uploadPgnInput.value = pgn;
        })
        reader.readAsText(file);
    }
})