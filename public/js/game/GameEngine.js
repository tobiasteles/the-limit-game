export class GameEngine {
    static async init(uid) {
        this.player = await Player.load(uid);
        this.monsters = [];
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastFrame = performance.now();
        this.movementVector = { x: 0, y: 0 };
        this.spawnTimer = 0;
        
        this.setupControls();
        this.gameLoop();
    }

    static gameLoop() {
        const now = performance.now();
        const delta = now - this.lastFrame;
        
        // Controle de FPS (60 FPS alvo)
        if (delta > 16.67) {
            this.update(delta);
            this.render();
            this.lastFrame = now - (delta % 16.67);
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }

    static update(delta) {
        const deltaSeconds = delta / 1000;
        
        // Movimento suave do jogador
        this.player.position.x += this.movementVector.x * deltaSeconds * 200;
        this.player.position.y += this.movementVector.y * deltaSeconds * 200;
        
        // Atualizar spawn com base no tempo
        this.spawnTimer += deltaSeconds;
        const monsterLimit = 5 + Math.sqrt(this.player.level);
        if (this.spawnTimer > 2 && this.monsters.length < monsterLimit) {
            this.spawnMonster();
            this.spawnTimer = 0;
        }
        
        // Checar colisões entre jogador e monstros
        this.checkCollisions();
    }

    static render() {
        // Limpar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar jogador
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(this.player.position.x - 10, this.player.position.y - 10, 20, 20);
        
        // Desenhar monstros
        this.ctx.fillStyle = '#e74c3c';
        this.monsters.forEach(monster => {
            this.ctx.fillRect(monster.position.x - 8, monster.position.y - 8, 16, 16);
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
        this.monsters.forEach((monster) => {
            // Colisão simples usando distância (AABB pode ser substituído por outro método)
            const distance = Math.sqrt(
                Math.pow(this.player.position.x - monster.position.x, 2) +
                Math.pow(this.player.position.y - monster.position.y, 2)
            );
            
            if (distance < 24) { // Raio de 24 pixels
                // Iniciar combate
                this.startCombat(monster);
                
                // Empurrar o jogador
                const angle = Math.atan2(
                    this.player.position.y - monster.position.y,
                    this.player.position.x - monster.position.x
                );
                
                this.player.position.x += Math.cos(angle) * 30;
                this.player.position.y += Math.sin(angle) * 30;
            }
        });
    }

    static startCombat(monster) {
        // Lógica de combate básica
        const playerDamage = this.player.level * 2;
        if (monster.takeDamage(playerDamage)) {
            this.player.gainXP(monster.level * 10);
            this.monsters.splice(this.monsters.indexOf(monster), 1);
        }
        
        // Dano ao jogador
        this.player.health -= monster.attack;
        if (this.player.health <= 0) {
            this.gameOver();
        }
    }

    static gameOver() {
        console.log("Game Over!");
        // Lógica adicional de fim de jogo aqui
    }
}
