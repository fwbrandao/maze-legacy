/**
 * Maze Legacy — ponto de entrada.
 */

import { Game } from './game.js';
import { AdventureMusic } from './music.js';

const canvas = document.getElementById('game-canvas');
const musicToggle = document.getElementById('music-toggle');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMessage = document.getElementById('overlay-message');
const overlayBtn = document.getElementById('overlay-btn');

const hud = {
  level: document.getElementById('level'),
  timer: document.getElementById('timer'),
  moves: document.getElementById('moves'),
  best: document.getElementById('best'),
  trackName: document.getElementById('track-name'),
};

const game = new Game(canvas, hud);
const music = new AdventureMusic();

function updateTrackLabel(level = game.level) {
  music.loadLevel(level);
  hud.trackName.textContent = music.getTrackName();
}

async function ensureMusic(level = 1) {
  await music.init();
  updateTrackLabel(level);
}

game.onLevelStart = (level) => {
  updateTrackLabel(level);
  if (!music.isMuted() && music.ctx) {
    music.startLevel(level);
  }
};

function updateMusicButton() {
  musicToggle.textContent = music.isMuted() ? '♪ Mudo' : '♪ Música';
  musicToggle.classList.toggle('muted', music.isMuted());
}

function showOverlay(title, message, btnText, onClick) {
  overlayTitle.textContent = title;
  overlayMessage.textContent = message;
  overlayBtn.textContent = btnText;
  overlay.classList.remove('hidden');
  overlayBtn.onclick = onClick;
}

function hideOverlay() {
  overlay.classList.add('hidden');
}

function showStartScreen() {
  showOverlay(
    'Maze Legacy',
    'Navegue pelo labirinto até a saída vermelha.\nCada nível é maior e o tempo mais curto.\nUse WASD ou as setas do teclado.',
    'Começar',
    async () => {
      await ensureMusic(1);
      hideOverlay();
      game.startLevel(1);
    }
  );
}

game.onStateChange = (state) => {
  if (state.won) {
    music.playVictory();
    const timeStr = game.formatTime(state.elapsed);
    showOverlay(
      `Nível ${state.level} completo!`,
      `Tempo: ${timeStr} · Passos: ${state.moves}\nPronto para o próximo desafio?`,
      'Próximo nível',
      () => {
        hideOverlay();
        game.nextLevel();
      }
    );
  } else if (state.lost) {
    music.playDefeat();
    showOverlay(
      'Tempo esgotado!',
      `Você não encontrou a saída a tempo.\nTente novamente no nível ${state.level}.`,
      'Tentar de novo',
      () => {
        hideOverlay();
        game.startLevel(state.level);
      }
    );
  }
};

document.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
    e.preventDefault();
  }
  game.handleKey(e.key);
});

function loop(now) {
  game.tick(now);
  if (game.running && !game.won && !game.lost) {
    game.render();
  }
  requestAnimationFrame(loop);
}

musicToggle.addEventListener('click', async () => {
  await music.init();
  const muted = music.toggleMute();
  if (!muted) music.start(game.level);
  updateMusicButton();
});

updateMusicButton();
showStartScreen();
requestAnimationFrame(loop);
