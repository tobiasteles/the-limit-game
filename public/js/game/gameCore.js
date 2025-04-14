// js/game/gameCore.js
import { Player } from './player.js';
import { MapGenerator } from './mapGenerator.js';
import { DungeonSystem } from './dungeonSystem.js';
import { CombatSystem } from './combatSystem.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;
        this.deltaTime = 0;
        
        this.init();
    }

    async init() {
        // Configuração inicial
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Carregar dados do jogador
        this.player = new Player();
        this.map = new MapGenerator(100, 100);
        this.dungeonSystem = new DungeonSystem();
        this.combatSystem = new CombatSystem();

        // Iniciar loop do jogo
        this.gameLoop(0);
    }

    gameLoop(timestamp) {
        this.deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Atualizar lógica
        this.update();
        
        // Renderizar
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.draw();

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    update() {
        this.player.update(this.deltaTime);
        this.dungeonSystem.update(this.player);
        this.combatSystem.update(this.player);
    }

    draw() {
        // Desenhar mapa
        this.map.draw(this.ctx, this.player);
        
        // Desenhar jogador
        this.player.draw(this.ctx);
        
        // Desenhar HUD
        document.getElementById('level').textContent = this.player.level;
        document.getElementById('xp').textContent = Math.floor(this.player.xp);
        document.getElementById('hp').textContent = Math.floor(this.player.hp);
    }
}

// Iniciar jogo quando carregado
window.addEventListener('load', () => new Game());