class Minesweeper {
    constructor(cols = 30, rows = 20, minesRatio = 0.167) {
        this.rows = rows;
        this.cols = cols;
        this.mines = Math.floor(rows * cols * minesRatio);
        this.board = [];
        this.gameOver = false;
        this.firstClick = true;
        this.flagMode = false;
        this.timer = 0;
        this.timerInterval = null;
        this.remainingMines = this.mines;
        this.clickedMine = null;
        
        this.init();
    }

    init() {
        this.createBoard();
        this.renderBoard();
        this.updateMineCount();
        this.setupEventListeners();
        this.board.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    createBoard() {
        this.board = Array(this.rows).fill().map(() => 
            Array(this.cols).fill().map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            }))
        );
    }

    placeMines(firstRow, firstCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            if (!this.board[row][col].isMine && 
                (Math.abs(row - firstRow) > 1 || Math.abs(col - firstCol) > 1)) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }
        
        this.calculateNeighborMines();
    }

    calculateNeighborMines() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.board[row][col].isMine) {
                    this.board[row][col].neighborMines = this.countNeighborMines(row, col);
                }
            }
        }
    }

    countNeighborMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < this.rows && 
                    newCol >= 0 && newCol < this.cols &&
                    this.board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    }

    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        const cellSize = 30;
        gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, ${cellSize}px)`;
        gameBoard.style.gridTemplateRows = `repeat(${this.rows}, ${cellSize}px)`;
        gameBoard.style.width = `${this.cols * cellSize}px`;
        gameBoard.style.height = `${this.rows * cellSize}px`;
        
        gameBoard.innerHTML = '';
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.board[row][col].isRevealed) {
                    cell.classList.add('revealed');
                    if (this.board[row][col].isMine) {
                        cell.classList.add('mine');
                        if (this.clickedMine && this.clickedMine.row === row && this.clickedMine.col === col) {
                            cell.style.backgroundColor = 'rgba(255, 68, 68, 0.9)';
                        }
                        cell.textContent = '💣';
                    } else if (this.board[row][col].neighborMines > 0) {
                        cell.textContent = this.board[row][col].neighborMines;
                        cell.style.color = this.getNumberColor(this.board[row][col].neighborMines);
                    }
                } else if (this.board[row][col].isFlagged) {
                    cell.classList.add('flagged');
                    cell.textContent = '🚩';
                }
                
                gameBoard.appendChild(cell);
            }
        }
    }

    getNumberColor(number) {
        const colors = ['#4444DD', '#229944', '#DD4444', '#DD44DD', '#44CCDD', '#DDCC44', '#444444', '#DDDDDD'];
        return colors[number - 1] || '#000000';
    }

    reveal(row, col) {
        if (this.board[row][col].isFlagged) return;
        
        if (this.board[row][col].isRevealed) {
            const flagCount = this.countNeighborFlags(row, col);
            if (flagCount === this.board[row][col].neighborMines) {
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const newRow = row + i;
                        const newCol = col + j;
                        if (newRow >= 0 && newRow < this.rows && 
                            newCol >= 0 && newCol < this.cols) {
                            this.revealCell(newRow, newCol);
                        }
                    }
                }
                return;
            }
            return;
        }
        
        this.revealCell(row, col);
    }

    revealCell(row, col) {
        if (this.board[row][col].isRevealed || this.board[row][col].isFlagged) return;
        
        this.board[row][col].isRevealed = true;
        
        if (this.firstClick) {
            this.placeMines(row, col);
            this.startTimer();
            this.firstClick = false;
        }
        
        if (this.board[row][col].isMine) {
            this.gameOver = true;
            this.clickedMine = { row, col };
            this.revealAll();
            this.stopTimer();
            return;
        }
        
        if (this.board[row][col].neighborMines === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    if (newRow >= 0 && newRow < this.rows && 
                        newCol >= 0 && newCol < this.cols) {
                        this.revealCell(newRow, newCol);
                    }
                }
            }
        }
        
        this.renderBoard();
        
        if (this.checkWin()) {
            this.gameOver = true;
            this.stopTimer();
        }
    }

    countNeighborFlags(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < this.rows && 
                    newCol >= 0 && newCol < this.cols &&
                    this.board[newRow][newCol].isFlagged) {
                    count++;
                }
            }
        }
        return count;
    }

    toggleFlag(row, col) {
        if (this.board[row][col].isRevealed) return;
        
        this.board[row][col].isFlagged = !this.board[row][col].isFlagged;
        this.remainingMines += this.board[row][col].isFlagged ? -1 : 1;
        this.updateMineCount();
        this.renderBoard();

        if (this.board[row][col].isFlagged) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    if (newRow >= 0 && newRow < this.rows && 
                        newCol >= 0 && newCol < this.cols) {
                        if (this.board[newRow][newCol].isRevealed) this.reveal(newRow, newCol);
                    }
                }
            }
        }

        if (this.checkWin()) {
            this.gameOver = true;
            this.stopTimer();
        }
    }

    revealAll() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].isMine && this.board[row][col].isFlagged) {
                    continue;
                }
                this.board[row][col].isRevealed = true;
                this.board[row][col].isFlagged = false;
            }
        }
        this.renderBoard();
    }

    checkWin() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col].isMine && !this.board[row][col].isFlagged) return false;
                if (!this.board[row][col].isMine && !this.board[row][col].isRevealed) return false;
            }
        }
        return true;
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('timer').textContent = this.timer;
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    updateMineCount() {
        document.getElementById('mine-count').textContent = this.remainingMines;
    }

    setupEventListeners() {
        const gameBoard = document.getElementById('game-board');
        const newGameBtn = document.getElementById('new-game');
        const toggleModeBtn = document.getElementById('toggle-mode');
        
        gameBoard.replaceWith(gameBoard.cloneNode(true));
        newGameBtn.replaceWith(newGameBtn.cloneNode(true));
        toggleModeBtn.replaceWith(toggleModeBtn.cloneNode(true));
        
        const freshGameBoard = document.getElementById('game-board');
        const freshNewGameBtn = document.getElementById('new-game');
        const freshToggleModeBtn = document.getElementById('toggle-mode');
        
        freshGameBoard.addEventListener('click', (e) => {
            if (this.gameOver) return;
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (this.board[row][col].isRevealed) {
                this.reveal(row, col);
            } else if (this.flagMode) {
                this.toggleFlag(row, col);
            } else {
                this.reveal(row, col);
            }
        });

        freshGameBoard.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (this.gameOver) return;
            
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            this.toggleFlag(row, col);
        });
        
        freshNewGameBtn.addEventListener('click', () => {
            this.gameOver = false;
            this.firstClick = true;
            this.timer = 0;
            this.remainingMines = this.mines;
            this.flagMode = false;
            this.stopTimer();
            document.getElementById('timer').textContent = '0';
            freshToggleModeBtn.textContent = 'Reveal Mode';
            freshToggleModeBtn.classList.remove('flag-mode');
            this.init();
        });
        
        freshToggleModeBtn.addEventListener('click', () => {
            this.flagMode = !this.flagMode;
            freshToggleModeBtn.textContent = this.flagMode ? 'Flag Mode' : 'Reveal Mode';
            freshToggleModeBtn.classList.toggle('flag-mode', this.flagMode);
        });
    }
}

const game = new Minesweeper(); 