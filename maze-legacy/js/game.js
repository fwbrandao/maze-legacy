/**
 * Lógica principal do Maze Legacy.
 */

import { generateMaze, getLevelConfig } from './maze.js';

const STORAGE_KEY = 'maze-legacy-best';

export class Game {
  constructor(canvas, hud) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hud = hud;

    this.level = 1;
    this.moves = 0;
    this.elapsed = 0;
    this.timeLimit = 120;
    this.running = false;
    this.won = false;
    this.lost = false;
    this.maze = null;
    this.player = { x: 0, y: 0 };
    this.cellSize = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.lastTick = 0;
    this.onStateChange = null;
  }

  loadBest() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return data;
    } catch {
      return {};
    }
  }

  saveBest(level, time, moves) {
    const data = this.loadBest();
    const key = `level-${level}`;
    const current = data[key];
    if (!current || time < current.time) {
      data[key] = { time, moves };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }

  formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  startLevel(level = this.level) {
    this.level = level;
    const config = getLevelConfig(level);
    this.timeLimit = config.timeLimit;
    this.moves = 0;
    this.elapsed = 0;
    this.running = true;
    this.won = false;
    this.lost = false;
    this.lastTick = performance.now();

    this.maze = generateMaze(config.width, config.height);
    this.player = { ...this.maze.start };
    this.calculateLayout();
    this.updateHud();
    this.render();
    this.notifyState();
  }

  calculateLayout() {
    const { cols, rows } = this.maze;
    const padding = 2;
    const maxW = this.canvas.width - padding * 2;
    const maxH = this.canvas.height - padding * 2;
    this.cellSize = Math.floor(Math.min(maxW / cols, maxH / rows));
    this.offsetX = Math.floor((this.canvas.width - cols * this.cellSize) / 2);
    this.offsetY = Math.floor((this.canvas.height - rows * this.cellSize) / 2);
  }

  updateHud() {
    const best = this.loadBest();
    const bestEntry = best[`level-${this.level}`];

    this.hud.level.textContent = this.level;
    this.hud.moves.textContent = this.moves;
    this.hud.timer.textContent = this.formatTime(
      Math.max(0, this.timeLimit - this.elapsed)
    );

    if (bestEntry) {
      this.hud.best.textContent = this.formatTime(bestEntry.time);
    } else {
      this.hud.best.textContent = '—';
    }

    if (this.timeLimit - this.elapsed <= 10 && this.running) {
      this.hud.timer.style.color = '#f85149';
    } else {
      this.hud.timer.style.color = '';
    }
  }

  tick(now) {
    if (!this.running || this.won || this.lost) return;

    const delta = (now - this.lastTick) / 1000;
    this.lastTick = now;
    this.elapsed += delta;

    if (this.elapsed >= this.timeLimit) {
      this.lost = true;
      this.running = false;
      this.notifyState();
    }

    this.updateHud();
  }

  move(dx, dy) {
    if (!this.running || this.won || this.lost) return;

    const nx = this.player.x + dx;
    const ny = this.player.y + dy;
    const { grid, cols, rows, exit } = this.maze;

    if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) return;
    if (grid[ny][nx] === 1) return;

    this.player.x = nx;
    this.player.y = ny;
    this.moves++;
    this.render();
    this.updateHud();

    if (nx === exit.x && ny === exit.y) {
      this.won = true;
      this.running = false;
      this.saveBest(this.level, this.elapsed, this.moves);
      this.notifyState();
    }
  }

  handleKey(key) {
    const k = key.toLowerCase();
    const map = {
      arrowup: [0, -1],
      arrowdown: [0, 1],
      arrowleft: [-1, 0],
      arrowright: [1, 0],
      w: [0, -1],
      s: [0, 1],
      a: [-1, 0],
      d: [1, 0],
    };

    if (map[k]) {
      const [dx, dy] = map[k];
      this.move(dx, dy);
      return true;
    }

    if (k === 'r') {
      this.startLevel(this.level);
      return true;
    }

    if (k === 'n' && !this.running) {
      this.startLevel(this.level);
      return true;
    }

    return false;
  }

  nextLevel() {
    this.startLevel(this.level + 1);
  }

  notifyState() {
    if (this.onStateChange) {
      this.onStateChange({
        won: this.won,
        lost: this.lost,
        level: this.level,
        moves: this.moves,
        elapsed: this.elapsed,
        timeLimit: this.timeLimit,
      });
    }
  }

  render() {
    const { grid, cols, rows, exit } = this.maze;
    const ctx = this.ctx;
    const cs = this.cellSize;
    const ox = this.offsetX;
    const oy = this.offsetY;

    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = ox + x * cs;
        const py = oy + y * cs;

        if (grid[y][x] === 1) {
          ctx.fillStyle = '#21262d';
          ctx.fillRect(px, py, cs, cs);
          ctx.strokeStyle = '#30363d';
          ctx.strokeRect(px + 0.5, py + 0.5, cs - 1, cs - 1);
        } else {
          ctx.fillStyle = '#0d1117';
          ctx.fillRect(px, py, cs, cs);

          const dist = Math.abs(x - this.player.x) + Math.abs(y - this.player.y);
          if (dist > 8) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(px, py, cs, cs);
          }
        }
      }
    }

    const ex = ox + exit.x * cs;
    const ey = oy + exit.y * cs;
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 300);
    ctx.fillStyle = `rgba(248, 81, 73, ${0.6 + pulse * 0.4})`;
    ctx.fillRect(ex + 2, ey + 2, cs - 4, cs - 4);
    ctx.strokeStyle = '#f85149';
    ctx.lineWidth = 2;
    ctx.strokeRect(ex + 2, ey + 2, cs - 4, cs - 4);

    const px = ox + this.player.x * cs;
    const py = oy + this.player.y * cs;
    ctx.fillStyle = '#3fb950';
    ctx.beginPath();
    ctx.arc(px + cs / 2, py + cs / 2, cs / 2 - 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#56d364';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#c9d1d9';
    ctx.beginPath();
    ctx.arc(px + cs / 2 - cs * 0.15, py + cs / 2 - cs * 0.1, cs * 0.1, 0, Math.PI * 2);
    ctx.arc(px + cs / 2 + cs * 0.15, py + cs / 2 - cs * 0.1, cs * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
}
