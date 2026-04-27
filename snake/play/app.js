import {
  createInitialState,
  setDirection,
  stepGame,
  togglePause,
} from "../../src/game.js";

const board = document.querySelector("[data-board]");
const context = board.getContext("2d");
const scoreEl = document.querySelector("[data-score]");
const statusEl = document.querySelector("[data-status]");
const overlay = document.querySelector("[data-overlay]");
const toggleButton = document.querySelector("[data-toggle]");
const restartButton = document.querySelector("[data-restart]");
const directionButtons = document.querySelectorAll("[data-dir]");

const GRID_SIZE = 16;
const SPEED_MS = 135;

const colors = {
  background: "#061316",
  grid: "rgba(148, 240, 205, 0.08)",
  snakeHead: "#7ff4c7",
  snakeBody: "#39cf8d",
  snakeTail: "#1da66a",
  food: "#ff6d8f",
  foodGlow: "rgba(255, 109, 143, 0.34)",
  wall: "rgba(255, 255, 255, 0.03)",
};

let state = {
  ...createInitialState({ gridSize: GRID_SIZE }),
  isPaused: true,
};
let lastTick = performance.now();
let accumulator = 0;

function restartGame() {
  state = {
    ...createInitialState({ gridSize: GRID_SIZE }),
    isPaused: true,
  };
  accumulator = 0;
  lastTick = performance.now();
  render();
}

function updateStatusText() {
  if (state.isGameOver) {
    statusEl.textContent = "Game over";
    overlay.style.display = "block";
    overlay.querySelector(".overlay__title").textContent = "游戏结束";
    overlay.querySelector(".overlay__copy").textContent = "按 Enter 或点击重新开始，继续挑战更高分。";
    return;
  }

  if (state.isPaused) {
    statusEl.textContent = state.score === 0 ? "Ready" : "Paused";
    overlay.style.display = "block";
    overlay.querySelector(".overlay__title").textContent = state.score === 0 ? "准备开始" : "已暂停";
    overlay.querySelector(".overlay__copy").textContent = state.score === 0
      ? "按空格、回车或点击暂停 / 继续开始游戏。"
      : "按空格或点击暂停 / 继续恢复游戏。";
    return;
  }

  statusEl.textContent = "Running";
  overlay.style.display = "none";
}

function resizeCanvas() {
  const size = board.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  board.width = Math.floor(size.width * dpr);
  board.height = Math.floor(size.height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  render();
}

function drawRoundedCell(x, y, size, radius, fillStyle) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + size, y, x + size, y + size, radius);
  context.arcTo(x + size, y + size, x, y + size, radius);
  context.arcTo(x, y + size, x, y, radius);
  context.arcTo(x, y, x + size, y, radius);
  context.closePath();
  context.fillStyle = fillStyle;
  context.fill();
}

function renderGrid(cellSize, offsetX, offsetY) {
  context.fillStyle = colors.background;
  context.fillRect(0, 0, board.clientWidth, board.clientHeight);

  context.fillStyle = colors.wall;
  context.fillRect(offsetX - 8, offsetY - 8, cellSize * GRID_SIZE + 16, cellSize * GRID_SIZE + 16);

  context.strokeStyle = colors.grid;
  context.lineWidth = 1;

  for (let index = 0; index <= GRID_SIZE; index += 1) {
    const pos = offsetX + index * cellSize;
    context.beginPath();
    context.moveTo(pos, offsetY);
    context.lineTo(pos, offsetY + cellSize * GRID_SIZE);
    context.stroke();
  }

  for (let index = 0; index <= GRID_SIZE; index += 1) {
    const pos = offsetY + index * cellSize;
    context.beginPath();
    context.moveTo(offsetX, pos);
    context.lineTo(offsetX + cellSize * GRID_SIZE, pos);
    context.stroke();
  }
}

function renderFood(cellSize, offsetX, offsetY) {
  if (!state.food) {
    return;
  }

  const x = offsetX + state.food.x * cellSize + 3;
  const y = offsetY + state.food.y * cellSize + 3;
  const size = cellSize - 6;
  const cx = x + size / 2;
  const cy = y + size / 2;
  const glow = context.createRadialGradient(cx, cy, 0, cx, cy, size);

  glow.addColorStop(0, colors.foodGlow);
  glow.addColorStop(1, "rgba(255, 109, 143, 0)");
  context.fillStyle = glow;
  context.beginPath();
  context.arc(cx, cy, size, 0, Math.PI * 2);
  context.fill();

  drawRoundedCell(x, y, size, 6, colors.food);
}

function renderSnake(cellSize, offsetX, offsetY) {
  state.snake.forEach((segment, index) => {
    const x = offsetX + segment.x * cellSize + 2;
    const y = offsetY + segment.y * cellSize + 2;
    const size = cellSize - 4;
    let fillStyle = colors.snakeBody;

    if (index === 0) {
      fillStyle = colors.snakeHead;
    } else if (index === state.snake.length - 1) {
      fillStyle = colors.snakeTail;
    }

    drawRoundedCell(x, y, size, 6, fillStyle);
  });
}

function render() {
  const boardSize = board.clientWidth;
  const cellSize = boardSize / GRID_SIZE;
  const offsetX = 0;
  const offsetY = 0;

  renderGrid(cellSize, offsetX, offsetY);
  renderFood(cellSize, offsetX, offsetY);
  renderSnake(cellSize, offsetX, offsetY);

  scoreEl.textContent = String(state.score);
  updateStatusText();
}

function step() {
  state = stepGame(state);

  if (state.isGameOver) {
    statusEl.textContent = "Game over";
  }

  render();
}

function gameLoop(now) {
  const delta = now - lastTick;
  lastTick = now;

  if (!state.isPaused && !state.isGameOver) {
    accumulator += delta;

    while (accumulator >= SPEED_MS) {
      step();
      accumulator -= SPEED_MS;

      if (state.isGameOver) {
        break;
      }
    }
  }

  window.requestAnimationFrame(gameLoop);
}

function applyDirection(direction) {
  state = setDirection(state, direction);
  render();
}

function handleTogglePause() {
  state = togglePause(state);
  render();
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowup" || key === "w") {
    event.preventDefault();
    applyDirection("up");
    return;
  }

  if (key === "arrowdown" || key === "s") {
    event.preventDefault();
    applyDirection("down");
    return;
  }

  if (key === "arrowleft" || key === "a") {
    event.preventDefault();
    applyDirection("left");
    return;
  }

  if (key === "arrowright" || key === "d") {
    event.preventDefault();
    applyDirection("right");
    return;
  }

  if (key === " ") {
    event.preventDefault();
    handleTogglePause();
    return;
  }

  if (key === "enter") {
    event.preventDefault();
    restartGame();
  }
});

toggleButton.addEventListener("click", handleTogglePause);
restartButton.addEventListener("click", restartGame);

directionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.dir;

    if (direction === "pause") {
      handleTogglePause();
      return;
    }

    applyDirection(direction);
  });
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
render();
window.requestAnimationFrame(gameLoop);
