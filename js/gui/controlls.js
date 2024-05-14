const backdrop = document.querySelector('.backdrop');
const confirmWindow = backdrop.querySelector('.confirm-popover');
const confirmMessage = confirmWindow.querySelector('.message');
const confirmBtn = document.getElementById('confirm');
const cancelBtn = document.getElementById('cancel');
const gameOver = document.querySelector('.game-over');
const closeResult = gameOver.querySelector('.close');

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

function showConfirmWindow(message) {
    confirmMessage.textContent = message;
    backdrop.classList.add('active');
    confirmWindow.classList.add('active');
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
    newGame();
})

const coordinates = document.querySelectorAll('.coordinates *');
function flipBoard() {
    boardLayout.classList.toggle('flipped');
    flipCoordinates();
}
function flipCoordinates() {
    let texts = boardLayout.classList.contains('flipped') ? '12345678hgfedcba':'87654321abcdefgh'
    console.log(texts);
    for(let i = 0; i<coordinates.length; i++) {
        coordinates[i].textContent = texts[i];
    }
}
