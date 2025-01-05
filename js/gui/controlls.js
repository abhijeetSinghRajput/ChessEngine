const backdrop = document.querySelector('.backdrop');
const downloadWindow = backdrop.querySelector('.download-window');
const settingWindow = backdrop.querySelector('.setting-window');
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
const uploadBookWindow = document.querySelector('.upload-book');

const themes = document.querySelectorAll('.theme');
themes.forEach(theme=>{
    theme.addEventListener('click', ()=>{
        themes.forEach(e=>e.classList.remove('active'));
        theme.classList.add('active');
        board.className = theme.textContent;
    })
})
document.getElementById('clear-board').addEventListener('click', () => {
    parseFen('8/8/8/8/8/8/8/8 w KQkq -');
    gui.renderPieces();
})
document.getElementById('reset-board').addEventListener('click', () => {
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

const popup = document.querySelector('.popup');
const popupMessage = popup.querySelector('.message');
function showPopup(message, success = true) {
    popupMessage.textContent = message;
    popup.classList.remove('success', 'danger');
    popup.classList.add('active', success ? 'success' : 'danger')
    setTimeout(()=>{
        popup.classList.remove('active');
    },2000);
}

function removeAllWindows(){
    document.querySelectorAll('.window').forEach(window=>{
        window.classList.remove('active');
    })
}
function showSettingWindow() {
    removeAllWindows();
    backdrop.classList.add('active');
    settingWindow.classList.add('active');
}
function showConfirmWindow() {
    uploadPgnInput.value = '';
    confirmBtn.textContent = 'new game';

    removeAllWindows();
    backdrop.classList.add('active');
    confirmWindow.classList.add('active');
    uploadProgressBar.style.width = `0%`;
}


function showDownloadWindow() {
    pgnOutput.value = getPGN();
    fenOutput.value = getFen();

    removeAllWindows();
    backdrop.classList.add('active');
    downloadWindow.classList.add('active');
}

function showUploadBookWindow() {
    removeAllWindows();
    backdrop.classList.add('active');
    uploadBookWindow.classList.add('active');
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
    setup = true;
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

window.addEventListener('keydown', (e) => {
    if (e.keyCode === 37) {
        gui.undoMove();
    }
    else if (e.keyCode === 39) {
        moveForward();
    }
})

const uploadBookBtn = document.getElementById('upload-book-btn');
const bookInput = document.getElementById('book-input');
const bookUploadProgress = document.querySelector('.book .progress');
const bookUploadPercent = document.querySelector('.book .percent');
const library = document.querySelector('.library');
const bookLoader = document.querySelector('.book');
const uploadBookName = bookLoader.querySelector('.file-name');
const defaultBook = library.querySelector('.book');

defaultBook.addEventListener('click', selectBook(defaultBook));
function selectBook(book) {
    return () => {
        if(book.classList.contains("selected")) return;
        document.querySelectorAll('.book').forEach(b => {
            b.classList.remove('selected');
        })
        book.classList.add('selected');
        if (book == defaultBook) {
            readPolyBook({ path: '../gm2600.bin' });
        }
        else {
            const fileName = book.querySelector('.file-name').textContent;
            readBookFromIndexedDB(fileName);
        }
    }
}
uploadBookBtn.addEventListener('click', () => {
    bookInput.click();
})

bookInput.addEventListener('change', uploadBook);

function uploadBook() {
    const file = bookInput.files[0];

    if (!file) {
        alert('Please select a file!');
        return;
    }
    bookLoader.style.display = 'block';
    uploadBookName.textContent = file.name;
    const reader = new FileReader();

    reader.onprogress = function (event) {
        if (event.lengthComputable) {
            const percentLoaded = Math.round((event.loaded / event.total) * 100);
            console.log(percentLoaded);
            bookUploadProgress.style.width = percentLoaded + '%';
            bookUploadPercent.textContent = percentLoaded + '%';
        }
    };
    reader.onload = function (event) {
        const buffer = event.target.result;  // This is the ArrayBuffer

        // Calculate file size
        const fileSize = file.size;
        let sizeText;
        if (fileSize >= 1024 * 1024) {
            sizeText = (fileSize / (1024 * 1024)).toFixed(2) + ' MB';
        } else if (fileSize >= 1024) {
            sizeText = (fileSize / 1024).toFixed(2) + ' KB';
        } else {
            sizeText = fileSize + ' B';
        }
        addBookToIndexedDB(buffer, file.name, sizeText);
        addBook(file.name, sizeText);
        bookLoader.style.display = 'none';
    }
    reader.readAsArrayBuffer(file);
}


function addBook(name, size, selected = false) {
    const book = document.createElement('div');
    const img = document.createElement('img');
    const detail = document.createElement('div');
    const fileName = document.createElement('div');
    const fileSize = document.createElement('div');
    const del = document.createElement('img');
    if (selected) {
        book.className.add('selected');
    }
    img.classList.add('icon');
    book.classList.add('book');
    detail.classList.add('detail');
    fileName.classList.add('file-name');
    fileSize.classList.add('file-size');
    del.classList.add('icon', 'delete');
    del.addEventListener('click', () => {
        removeBookFromIndexedDB(fileName.textContent);
        if (book.classList.contains('selected')) {
            setTimeout(() => {
                defaultBook.click();
            }, 0);
        }
        book.remove();
    })
    img.src = "./assets/icons/book.svg"
    del.src = "./assets/icons/delete.png"

    fileSize.textContent = size;
    fileName.textContent = name;


    detail.appendChild(fileName);
    detail.appendChild(fileSize);

    book.appendChild(img);
    book.appendChild(detail);
    book.appendChild(del);
    book.addEventListener('click', selectBook(book));
    library.appendChild(book);
}

