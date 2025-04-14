export class Player {
    constructor() {
        // Carregar do Firestore
        this.x = 0;
        this.y = 0;
        this.speed = 200;
        this.level = 1;
        this.xp = 0;
        this.maxXp = 100;
        this.hp = 100;
        this.maxHp = 100;
        this.classType = 'warrior';
        this.equipment = {};
        
        this.initControls();
    }

    initControls() {
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }

    update(deltaTime) {
        // Movimentação
        if(this.keys['ArrowUp']) this.y -= this.speed * deltaTime;
        if(this.keys['ArrowDown']) this.y += this.speed * deltaTime;
        if(this.keys['ArrowLeft']) this.x -= this.speed * deltaTime;
        if(this.keys['ArrowRight']) this.x += this.speed * deltaTime;
    }

    draw(ctx) {
        // Desenhar sprite baseado na classe
        ctx.fillStyle = '#FF4141';
        ctx.fillRect(this.x - 16, this.y - 32, 32, 64);
    }
}