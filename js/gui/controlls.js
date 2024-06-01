const backdrop = document.querySelector('.backdrop');
const downloadWindow = backdrop.querySelector('.download-window');
const confirmWindow = backdrop.querySelector('.confirm-popover');

const downloadOptions = downloadWindow.querySelectorAll('.option>*');
const downloadBtn = downloadWindow.querySelector('.btn.download');

const confirmBtn = document.getElementById('confirm');
const setupBtn = document.getElementById('setup-btn');
const gameOver = document.querySelector('.game-over');
const closeResult = gameOver.querySelector('.close');

const pgnOutput = downloadWindow.querySelector('.pgn textarea');
const fenOutput = downloadWindow.querySelector('.fen input');

const uploadPgnBtn = document.getElementById('upload-pgn-btn');
const uploadPgnInput = document.getElementById('upload-pgn-input');
const uploadPgnContainer = document.querySelector('.upload');
const uploadFenInput = document.getElementById('upload-fen-input');
const uploadProgressBar = document.getElementById('upload-bar');
const winAnimation = document.querySelector('dotlottie-player.win-animation');

document.getElementById('clear-board').addEventListener('click',()=>{
    parseFen('8/8/8/8/8/8/8/8 w KQkq -');
    gui.renderPieces();
})
document.getElementById('reset-board').addEventListener('click',()=>{
    parseFen(StartingFen);
    gui.renderPieces();
})

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
    uploadProgressBar.style.width = `0%`;
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

setupBtn.addEventListener('click', () => {
    setupPosition.classList.add('active');
    removeBackdrop();
})

confirmBtn.addEventListener('click', () => {
    if (uploadPgnInput.value) {
        try {
            parsePGN(uploadPgnInput.value);
        } catch (error) {
            console.error(error);
            alert(error);
        }
    }
    else {
        newGame(uploadFenInput.value);
    }
    removeBackdrop();
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





uploadPgnContainer.addEventListener('dragover', (e) => {
    uploadPgnContainer.classList.add('file-hover');
    e.preventDefault();
});

uploadPgnContainer.addEventListener('dragleave', () => {
    uploadPgnContainer.classList.remove('file-hover');
});
uploadPgnContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadPgnContainer.classList.remove('file-hover');
    const file = e.dataTransfer.files[0];
    resetProgressWidth();
    readPgnFile(file);
});

const fileInput = document.getElementById('file-input');

uploadPgnBtn.addEventListener('click', () => {
    fileInput.click();
})

uploadPgnInput.addEventListener('input', () => {
    uploadFenInput.value = '';
    confirmBtn.textContent = (uploadPgnInput.value) ? 'load game' : 'new game';
});
uploadFenInput.addEventListener('input', () => {
    uploadPgnInput.value = '';
    confirmBtn.textContent = (uploadFenInput.value) ? 'load game' : 'new game';
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    resetProgressWidth();
    readPgnFile(file);
});

function readPgnFile(file) {
    if (!file) return;

    confirmBtn.disabled = true;

    if (!file.name.endsWith('.pgn')) {
        alert('Please upload a valid PGN file.');
        return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', (e) => {
        const pgn = e.target.result;
        uploadPgnInput.value = pgn;
        uploadFenInput.value = '';

        confirmBtn.textContent = (uploadPgnInput.value) ? 'load game' : 'new game';
        confirmBtn.disabled = false;
    });

    reader.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            uploadProgressBar.style.width = `${progress}%`;
        }
    });

    reader.addEventListener('error', (e) => {
        console.error('File reading error:', e.target.error);
        alert(e.target.error);
    });

    reader.readAsText(file);
}

function resetProgressWidth() {
    uploadProgressBar.style.transition = 'none';
    uploadProgressBar.style.width = 0;
    void uploadProgressBar.offsetWidth;
    uploadProgressBar.style.transition = 'width .3s';
}

// ======================================================
// ========== drop down search time controller ==========
// ======================================================
const selections = document.querySelectorAll('.selection');
const options = document.querySelectorAll('.drop-menu .options');

function removeSelectFrom(option) {
    [...option.children].forEach(child => {
        child.classList.remove('select');
    });
}

options.forEach(option => {
    [...option.children].forEach(child => {
        child.addEventListener('click', () => {
            removeSelectFrom(option);
            child.classList.add('select');
            if (option.id == 'white') {
                selections[1].textContent = child.textContent + 's';
                engine.searchTime[Color.white] = +child.textContent;
            }
            else {
                selections[0].textContent = child.textContent + 's';
                engine.searchTime[Color.black] = +child.textContent;
            }
        })
    })
})
selections.forEach(selection => {
    selection.addEventListener('click', () => {
        removeDropDown();
        selection.parentElement.classList.add('active');
    })
})

function removeDropDown() {
    selections.forEach(selection => {
        selection.parentElement.classList.remove('active');
    })
}
document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('selection')) {
        removeDropDown();
    }
})