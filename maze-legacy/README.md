# Maze Legacy

Jogo de labirinto com geração procedural, níveis progressivos e visual retrô.

## Como jogar

1. Abra `index.html` no navegador, ou sirva a pasta com um servidor local:

```bash
cd maze-legacy
python3 -m http.server 8080
```

Depois acesse http://localhost:8080

2. Use **WASD** ou **setas** para mover o personagem verde.
3. Chegue à **saída vermelha** antes do tempo acabar.
4. Cada nível aumenta o tamanho do labirinto e reduz o tempo disponível.

## Controles

| Tecla | Ação |
|-------|------|
| W / ↑ | Mover para cima |
| S / ↓ | Mover para baixo |
| A / ← | Mover para esquerda |
| D / → | Mover para direita |
| R | Reiniciar o nível atual |
| N | Novo labirinto (quando pausado) |

## Recursos

- Labirintos únicos gerados com algoritmo Recursive Backtracker
- 12+ níveis com dificuldade crescente
- Contador de passos e cronômetro regressivo
- Recorde salvo por nível no navegador (localStorage)
- Névoa parcial — só vê áreas próximas ao jogador
- Trilha sonora de aventura em estilo chiptune (Web Audio API)
- **Música exclusiva por fase** — cada nível gera uma trilha única (melodia, harmonia, baixo e tempo próprios)
- Nome temático da trilha exibido no HUD

## Estrutura

```
maze-legacy/
├── index.html      # Página principal
├── css/style.css   # Estilos retrô
└── js/
    ├── main.js     # Entrada e UI
    ├── game.js     # Lógica do jogo
    └── maze.js     # Geração de labirintos
    └── music.js    # Trilha sonora de aventura
```

## Tecnologias

HTML5 Canvas, JavaScript (ES modules), CSS — sem dependências de build.
