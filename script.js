const X_CLASS = 'x';
const CIRCLE_CLASS = 'circle';

const boards = {
    "3x3": document.getElementById('game-board-3x3'),
    "4x4": document.getElementById('game-board-4x4'),
    "5x5": document.getElementById('game-board-5x5'),
};

const messages = {
    "3x3": document.getElementById('winning-message-3x3'),
    "4x4": document.getElementById('winning-message-4x4'),
    "5x5": document.getElementById('winning-message-5x5'),
};

const backButtons = {
    "3x3": document.querySelector('#play33 .back-button'),
    "4x4": document.querySelector('#play44 .back-button'),
    "5x5": document.querySelector('#play55 .back-button'),
};

const grid = document.getElementById("grid");
const leftArrow = document.getElementById("left-arrow");
const rightArrow = document.getElementById("right-arrow");
const startButton = document.getElementById("start-game");
const modeTitle = document.getElementById("mode-title");

let gameState = {
    "3x3": { circleTurn: false, moves: 0 },
    "4x4": { circleTurn: false, moves: 0 },
    "5x5": { circleTurn: false, moves: 0 },
};

function initializeTurnIndicator(mode) {
    const turnIndicator = document.getElementById(`turn-indicator-${mode}`);
    turnIndicator.textContent = "Let's get started!";
    turnIndicator.classList.add('turn-indicator-style');

    const player1Box = document.getElementById('player1-box');
    const player2Box = document.getElementById('player2-box');

    const player1Icon = document.getElementById('player1-icon');
    const player2Icon = document.getElementById('player2-icon');

    const player1Name = document.getElementById('player1-name');
    const player2Name = document.getElementById('player2-name');

    // Dynamically set player icons and names
    player1Icon.src = playerIcons.player1 || 'default-icon.png';
    player2Icon.src = playerIcons.player2 || 'default-icon.png';

    player1Name.textContent = playerIcons.player1Name || 'Player 1';
    player2Name.textContent = playerIcons.player2Name || 'Player 2';


    // Highlight Player 1 as active by default
    highlightActivePlayer('player1-box');
}


// Navigation logic
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');

        // Show player-boxes only for game pages
        const isGamePage = pageId.startsWith('play');
        document.getElementById('player-boxes').style.display = isGamePage ? 'flex' : 'none';

        if (isGamePage) {
            const mode = pageId.slice(-2); // Extract mode (e.g., '33', '44', '55')
            setupBoard(boards[mode], mode);
        }
    }
}


//Enter player name
function submitPlayerNames() {
    const player1Name = document.getElementById('player1-name').value.trim();
    const player2Name = document.getElementById('player2-name').value.trim();

    if (player1Name === "" || player2Name === "") {
        alert("Both players must enter their names!");
        return;
    }

    // Store player names
    playerIcons.player1Name = player1Name;
    playerIcons.player2Name = player2Name;

    // Navigate to mode selection
    navigateTo('mode-selection');
}

const iconPool = ['Drummer.png', 'Guitarist.png', 'Keyboardist.png', 'Vocalist.png'];
let playerIcons = { player1: '', player2: '' };

Object.entries(boards).forEach(([mode, board]) => {
    assignRandomIcons(); // Assign random icons before setting up the board
    setupBoard(board, mode);
});



// Function to set player names
function setPlayerNames(player1Name, player2Name) {
    playerIcons.player1Name = player1Name || "Player 1"; // Fallback to "Player 1"
    playerIcons.player2Name = player2Name || "Player 2"; // Fallback to "Player 2"
    console.log("Player 1 Name:", playerIcons.player1Name); // Debugging
    console.log("Player 2 Name:", playerIcons.player2Name); // Debugging
}



// Update the turn indicator
function highlightActivePlayer(playerBoxId) {
    document.querySelectorAll('.player-box').forEach(box => {
        box.classList.remove('active');
    });
    const activeBox = document.getElementById(playerBoxId);
    activeBox.classList.add('active');
}

function updateTurnIndicator(mode) {
    const isCircleTurn = gameState[mode].circleTurn;
    const currentPlayerName = isCircleTurn ? playerIcons.player2Name : playerIcons.player1Name;

    const playerBoxId = isCircleTurn ? 'player2-box' : 'player1-box';
    highlightActivePlayer(playerBoxId);

    const turnIndicator = document.getElementById(`turn-indicator-${mode}`);
    turnIndicator.innerHTML = `<span style="color: ${isCircleTurn ? 'rgb(8, 135, 233)' : 'red'};">
        ${currentPlayerName}'s Turn
    </span>`;
}


function assignRandomIcons() {
    const shuffledIcons = [...iconPool].sort(() => Math.random() - 0.5);
    playerIcons.player1 = shuffledIcons[0];
    playerIcons.player2 = shuffledIcons[1];
}

// Update restart button to randomize icons before resetting the board
document.querySelectorAll('.restart-button').forEach(button =>
    button.addEventListener('click', (e) => {
        const mode = e.target.dataset.mode;
        assignRandomIcons(); // Assign new icons for each reset
        resetBoard(boards[mode], mode);
    })
);

function setupBoard(board, mode) {
    const size = parseInt(mode[0]);
    const cellCount = size * size;

    board.innerHTML = ''; // Clear the board
    for (let i = 0; i < cellCount; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        board.appendChild(cell);

        cell.addEventListener('click', (e) => handleClick(e, mode), { once: true });
    }

    initializeTurnIndicator(mode); // Initialize turn indicator and player boxes
}

// Handle cell click
function handleClick(e, mode) {
    const cell = e.target;
    const board = boards[mode];
    const state = gameState[mode];
    
    // Prevent further clicks if the game is over
    if (state.gameOver || cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)) {
        return; // Game is over, or the cell is already filled
    }

    const currentClass = state.circleTurn ? CIRCLE_CLASS : X_CLASS;

    const clickSound = new Audio('Click.mp3'); 
    clickSound.play();

    placeMark(cell, currentClass);
    state.moves++;

    const winningCombinations = generateWinningCombinations(parseInt(mode[0]));

    if (checkWin(board, currentClass, winningCombinations)) {
        state.gameOver = true; // Mark the game as over
        displayWinningMessage(
            mode,
            `${state.circleTurn ? playerIcons.player2Name : playerIcons.player1Name} WINS`
        );
    } else if (state.moves === parseInt(mode[0]) ** 2) {
        state.gameOver = true; // Mark the game as over in case of a draw
        displayWinningMessage(mode, "DRAW");
    } else {
        state.circleTurn = !state.circleTurn; // Switch turns
        updateTurnIndicator(mode); // Update turn indicator after a move
    }
}


function placeMark(cell, currentClass) {
    const playerIcon = currentClass === X_CLASS ? playerIcons.player1 : playerIcons.player2;
    cell.style.backgroundImage = `url('${playerIcon}')`;
    cell.style.backgroundSize = 'cover';
    cell.style.backgroundPosition = 'center';
    cell.classList.add(currentClass);
}



function checkWin(board, currentClass, winningCombinations) {
    const cells = [...board.querySelectorAll('.cell')];
    const winningCombination = winningCombinations.find(combination =>
        combination.every(index => cells[index]?.classList.contains(currentClass))
    );

    if (winningCombination) {
        winningCombination.forEach(index => cells[index].classList.add('winning-cell'));
        return true;
    }
    return false;
}


function displayWinningMessage(mode, message) {
    const messageElement = messages[mode];

    if (message === "DRAW") {
        // Handle draw scenario
        messageElement.querySelector(`#winning-message-text-${mode}`).innerText = "DRAW!";
    } else {
        // Handle win scenario
        const winner = gameState[mode].circleTurn
            ? playerIcons.player2Name
            : playerIcons.player1Name;
        messageElement.querySelector(`#winning-message-text-${mode}`).innerText = `${winner} WINS!`;
    }

    messageElement.classList.remove('hidden');
    

    if (message !== "DRAW") {
        document.getElementById('firework-sound').play();
        createEnhancedFireworkEffect(mode);
    }
    else {
        document.getElementById('draw-sound').play();
    }
}


function createEnhancedFireworkEffect(mode) {
    const messageElement = document.getElementById(`winning-message-${mode}`);
    const fireworkContainer = messageElement; // Use the message container to append fireworks

    // Create the main firework burst
    const firework = document.createElement('div');
    firework.classList.add('firework');
    firework.style.left = `${fireworkContainer.offsetWidth / 2 - 10}px`; // Center firework
    firework.style.top = `${fireworkContainer.offsetHeight / 2 - 10}px`;

    fireworkContainer.appendChild(firework);

    // Create multiple sparks to simulate an explosion
    for (let i = 0; i < 100; i++) {
        const spark = document.createElement('div');
        spark.classList.add('sparks');
        
        // Randomly choose spark color
        const colorClass = ['blue', 'orange', 'purple', 'green'][Math.floor(Math.random() * 4)];
        spark.classList.add(`spark-${colorClass}`);

        // Random angle and distance for each spark
        const angle = Math.random() * 360; // Random angle for spark direction
        const distance = Math.random() * 60 + 40; // Random distance for explosion radius

        // Calculate position based on angle and distance
        const offsetX = Math.cos(angle * Math.PI / 180) * distance;
        const offsetY = Math.sin(angle * Math.PI / 180) * distance;

        // Set random position and animation
        spark.style.left = `${50 + offsetX}%`;
        spark.style.top = `${50 + offsetY}%`;

        fireworkContainer.appendChild(spark);

        // Trigger spark animation
        spark.classList.add('firework-spark');
    }

    // Trigger firework shoot animation
    firework.classList.add('shooting-firework');

    // Remove firework and sparks after animation ends
    setTimeout(() => {
        fireworkContainer.removeChild(firework);
        const sparks = fireworkContainer.getElementsByClassName('sparks');
        for (let i = 0; i < sparks.length; i++) {
            fireworkContainer.removeChild(sparks[i]);
        }
    }, 15000); // Extended timeout (increase the duration of the firework effect)
}


function resetBoard(board, mode) {
    const cells = board.querySelectorAll('.cell');
    cells.forEach(cell => {
        // Add a fade-out animation before resetting
        cell.classList.add('fade-out');
        setTimeout(() => {
            cell.classList.remove(X_CLASS, CIRCLE_CLASS, 'winning-cell');
            cell.style.backgroundImage = ''; // Reset background
            cell.classList.remove('fade-out'); // Remove fade-out effect after animation
        }, 300); // Wait for fade-out effect to complete before clearing
    });

    // Reset game state
    gameState[mode] = { circleTurn: false, moves: 0, gameOver: false }; // Set gameOver to false
    messages[mode].classList.add('hidden');
    setupBoard(board, mode);
}


function generateWinningCombinations(size) {
    const combinations = [];

    // Rows
    for (let i = 0; i < size * size; i += size) {
        combinations.push([...Array(size)].map((_, j) => i + j));
    }

    // Columns
    for (let i = 0; i < size; i++) {
        combinations.push([...Array(size)].map((_, j) => i + j * size));
    }

    // Diagonals
    combinations.push([...Array(size)].map((_, i) => i * (size + 1)));
    combinations.push([...Array(size)].map((_, i) => (i + 1) * (size - 1)).slice(0, size));

    return combinations;
}



//Grid display
// Define available game modes
const gameModes = [
    { mode: "3x3", size: 3 },
    { mode: "4x4", size: 4 },
    { mode: "5x5", size: 5 },
];

let currentModeIndex = 0;

// Function to render the grid based on the selected game mode
function renderGrid(size) {
    grid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    // Clear previous cells
    grid.innerHTML = "";

    // Add cells to the grid
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.textContent = ""; // Cells are empty placeholders
        grid.appendChild(cell);
    }
}

// Update the displayed grid and mode information
function updateGrid() {
    const currentMode = gameModes[currentModeIndex];
    renderGrid(currentMode.size);
}

// Event listeners for navigation arrows
leftArrow.addEventListener("click", () => {
    currentModeIndex = (currentModeIndex - 1 + gameModes.length) % gameModes.length;
    updateGrid();
});

rightArrow.addEventListener("click", () => {
    currentModeIndex = (currentModeIndex + 1) % gameModes.length;
    updateGrid();
});

// Event listener for the start button
startButton.addEventListener("click", () => {
    const selectedMode = gameModes[currentModeIndex];
    const targetPageId = `play${selectedMode.size}${selectedMode.size}`; // Constructs the target ID
    navigateTo(targetPageId); // Navigate to the specific page
});


// Initialize with the first game mode
updateGrid();



    // Load the sound file
    const clickSound = new Audio('Robot click.mp3'); // Replace with your sound file path

    // Select all buttons except the arrows
    const buttons = document.querySelectorAll('button:not(#left-arrow):not(#right-arrow)');

    // Attach click event listeners to play the sound
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            clickSound.play();
        });
    });

    const arrowClickSound = new Audio('Navigation.mp3');
    const arrows = document.querySelectorAll('#left-arrow, #right-arrow');

// Add click event listeners for arrow buttons (sound plays on every click)
arrows.forEach(arrow => {
    arrow.addEventListener('click', () => {
        // Create a new audio instance for each click to avoid overlapping issues
        const newArrowSound = new Audio('Navigation.mp3');
        newArrowSound.play();
    });
});


// Get the background audio element
const backgroundSound = document.getElementById('background-sound');


// Play the audio when the page loads
backgroundSound.play().catch((err) => {
    console.error('Audio autoplay failed:', err);
});

// Handle volume control slider input
const volumeSlider = document.getElementById('volume-slider');

// Set slider value based on the initial volume
volumeSlider.value = backgroundSound.volume;

// Adjust the audio volume as the user moves the slider
volumeSlider.addEventListener('input', () => {
    backgroundSound.volume = volumeSlider.value;
});

// Handle notification box close action
document.getElementById('close-notification').addEventListener('click', () => {
    const notificationBox = document.getElementById('notification-box');

    // Add shrink-to-center class to trigger animation
    notificationBox.classList.add('shrink-to-center');

    // Wait for the animation to finish, then hide the notification box
    setTimeout(() => {
        notificationBox.style.display = 'none'; // Hide the box after shrinking animation
    }, 500); // Match this duration to the shrink-to-center animation length (0.5s)

    // Unmute and play sound
    backgroundSound.muted = false;
    backgroundSound.play().catch((err) => {
        console.error('Audio autoplay failed:', err);
    });
});


// Get the winning sound element
const fireworkSound = document.getElementById('firework-sound');
fireworkSound.volume = 0.4;

//Ready...go
