/**
 * Geração procedural de labirintos usando Recursive Backtracker.
 */

const DIRECTIONS = [
  { dx: 0, dy: -2 },
  { dx: 2, dy: 0 },
  { dx: 0, dy: 2 },
  { dx: -2, dy: 0 },
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generateMaze(width, height, seed = Date.now()) {
  const cols = width * 2 + 1;
  const rows = height * 2 + 1;

  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 1)
  );

  let rng = seed;
  const random = () => {
    rng = (rng * 16807 + 0) % 2147483647;
    return (rng - 1) / 2147483646;
  };

  const stack = [];
  let cx = 1;
  let cy = 1;
  grid[cy][cx] = 0;

  do {
    const neighbors = [];

    for (const { dx, dy } of DIRECTIONS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === 1) {
        neighbors.push({ nx, ny, wx: cx + dx / 2, wy: cy + dy / 2 });
      }
    }

    if (neighbors.length > 0) {
      shuffle(neighbors);
      const pick = neighbors[Math.floor(random() * neighbors.length)];
      grid[pick.wy][pick.wx] = 0;
      grid[pick.ny][pick.nx] = 0;
      stack.push({ x: cx, y: cy });
      cx = pick.nx;
      cy = pick.ny;
    } else if (stack.length > 0) {
      const prev = stack.pop();
      cx = prev.x;
      cy = prev.y;
    }
  } while (stack.length > 0);

  const start = { x: 1, y: 1 };
  const exit = { x: cols - 2, y: rows - 2 };

  grid[start.y][start.x] = 0;
  grid[exit.y][exit.x] = 0;

  return { grid, cols, rows, start, exit, width, height };
}

export function getLevelConfig(level) {
  const base = 8 + Math.min(level - 1, 12);
  const timeLimit = Math.max(30, 120 - (level - 1) * 8);

  return {
    width: base,
    height: base,
    timeLimit,
    level,
  };
}
