import { Player } from '../game/Player.js';
import { Monster } from '../game/Monster.js';
import { lightenColor, darkenColor } from './utils.js';

export class GameEngine {
    static async init(uid) {
        this.player = await Player.load(uid);
        this.monsters = [];
        this.lootItems = [];
        this.particles = [];
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastFrame = performance.now();
        this.movementVector = { x: 0, y: 0 };
        this.spawnTimer = 0;
        this.cameraOffsetX = 0;
        this.cameraOffsetY = 0;

        this.setupControls();
        this.gameLoop();
    }

    static gameLoop() {
        const now = performance.now();
        const delta = now - this.lastFrame;
        if (delta > 16.67) {
            this.update(delta);
            this.render();
            this.lastFrame = now - (delta % 16.67);
        }
        requestAnimationFrame(() => this.gameLoop());
    }

    static update(delta) {
        const deltaSeconds = delta / 1000;
        this.player.position.x += this.movementVector.x * deltaSeconds * 200;
        this.player.position.y += this.movementVector.y * deltaSeconds * 200;
        
        this.spawnTimer += deltaSeconds;
        const monsterLimit = 5 + Math.sqrt(this.player.level);
        if (this.spawnTimer > 2 && this.monsters.length < monsterLimit) {
            this.spawnMonster();
            this.spawnTimer = 0;
        }
        
        this.checkCollisions();
        this.updateParticles(delta);
    }

    static render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateCamera();
        this.ctx.save();
        this.ctx.translate(-this.cameraOffsetX, -this.cameraOffsetY);
        
        this.ctx.fillStyle = 'rgba(46, 204, 113, 0.1)';
        this.ctx.fillRect(this.cameraOffsetX, this.cameraOffsetY, this.canvas.width, this.canvas.height);
        
        this.renderParticles();
        this.drawPlayer();
        this.drawMonsters();
        
        this.ctx.restore();
    }

    static drawPlayer() {
        const size = 20;
        const { x, y } = this.player.position;
        this.ctx.save();
        this.ctx.translate(x, y);
        if (this.movementVector.x !== 0 || this.movementVector.y !== 0) {
            const angle = Math.atan2(this.movementVector.y, this.movementVector.x);
            this.ctx.rotate(angle + Math.PI / 2);
        }
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size);
        this.ctx.lineTo(-size / 2, size);
        this.ctx.lineTo(size / 2, size);
        this.ctx.closePath();
        
        // Usa a cor do jogador para o gradiente
        const gradient = this.ctx.createLinearGradient(0, -size, 0, size);
        gradient.addColorStop(0, lightenColor(this.player.color, 20));
        gradient.addColorStop(1, darkenColor(this.player.color, 20));
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.restore();
    }

    static drawMonsters() {
        this.monsters.forEach(monster => {
            const { x, y } = monster.position;
            const radius = 16;
            const sides = 6;
    
            this.ctx.beginPath();
            this.ctx.moveTo(x + radius * Math.cos(0), y + radius * Math.sin(0));
            for (let i = 1; i <= sides; i++) {
                const angle = (i * 2 * Math.PI) / sides;
                this.ctx.lineTo(
                    x + radius * Math.cos(angle),
                    y + radius * Math.sin(angle)
                );
            }
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, '#e74c3c');
            gradient.addColorStop(1, '#c0392b');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Olhos
            this.ctx.beginPath();
            this.ctx.arc(x - 5, y - 5, 3, 0, Math.PI * 2);
            this.ctx.arc(x + 5, y - 5, 3, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fill();
        });
    }

    static setupControls() {
        const speed = 1;
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp': this.movementVector.y = -speed; break;
                case 'ArrowDown': this.movementVector.y = speed; break;
                case 'ArrowLeft': this.movementVector.x = -speed; break;
                case 'ArrowRight': this.movementVector.x = speed; break;
                case 'i':
                case 'I': {
                    const inventory = document.getElementById('inventory-ui');
                    inventory.classList.toggle('hidden');
                    break;
                }
            }
        });
        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'ArrowDown': this.movementVector.y = 0; break;
                case 'ArrowLeft':
                case 'ArrowRight': this.movementVector.x = 0; break;
            }
        });
    }

    static spawnMonster() {
        const newMonster = new Monster(this.player.level);
        this.monsters.push(newMonster);
    }
    
    static checkCollisions() {
        this.monsters.forEach(monster => {
            const distance = Math.hypot(
                this.player.position.x - monster.position.x,
                this.player.position.y - monster.position.y
            );
            if (distance < 24) {
                this.startCombat(monster);
            }
        });
    }

    static startCombat(monster) {
        const isCritical = Math.random() < 0.1;
        const baseDamage = this.player.level * (isCritical ? 3 : 2);
        const playerDamage = baseDamage + Math.random() * 5;

        if (monster.takeDamage(playerDamage)) {
            this.player.gainXP(monster.level * 10);
            this.spawnLoot(monster.position);
            this.monsters.splice(this.monsters.indexOf(monster), 1);
        }

        this.showDamageText(playerDamage, monster.position, isCritical);
        this.player.health -= monster.attack;
        if (this.player.health <= 0) {
            this.gameOver();
        }
    }

    static spawnLoot(position) {
        const loot = {
            type: ['gold', 'potion', 'equipment'][Math.floor(Math.random() * 3)],
            amount: Math.floor(Math.random() * 10) + 1,
            position: position
        };
        this.lootItems.push(loot);
    }
    
    static gameOver() {
        console.log("Game Over!");
    }
    
    static showDamageText(damage, position, isCritical) {
        console.log(`Damage: ${damage} at (${position.x}, ${position.y}) ${isCritical ? '(Critical)' : ''}`);
    }

    static createParticles(position, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: position.x,
                y: position.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 1,
                color: color
            });
        }
    }

    static updateParticles(delta) {
        this.particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }

    static renderParticles() {
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        });
        this.ctx.globalAlpha = 1;
    }

    static updateCamera() {
        const canvasCenterX = this.canvas.width / 2;
        const canvasCenterY = this.canvas.height / 2;
        this.cameraOffsetX = this.player.position.x - canvasCenterX;
        this.cameraOffsetY = this.player.position.y - canvasCenterY;
    }
}

// Função para clarear uma cor hexadecimal
function lightenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    let r = (num >> 16) & 0xFF;
    let g = (num >> 8) & 0xFF;
    let b = num & 0xFF;
    r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Função para escurecer uma cor hexadecimal
function darkenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    let r = (num >> 16) & 0xFF;
    let g = (num >> 8) & 0xFF;
    let b = num & 0xFF;
    r = Math.max(0, Math.floor(r - r * (percent / 100)));
    g = Math.max(0, Math.floor(g - g * (percent / 100)));
    b = Math.max(0, Math.floor(b - b * (percent / 100)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
