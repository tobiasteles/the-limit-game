export class Monster {
    constructor(playerLevel) {
        this.level = Math.floor(playerLevel * (0.8 + Math.random() * 0.4)); // Nível baseado no jogador
        this.health = 50 + (this.level * 10);
        this.attack = 5 + (this.level * 2);
        this.position = this.generateRandomPosition();
    }

    generateRandomPosition() {
        return {
            x: Math.random() * 800,
            y: Math.random() * 600
        };
    }

    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }
}