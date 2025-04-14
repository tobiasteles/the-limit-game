export class CombatSystem {
    constructor() {
        this.attackCooldown = 0.5;
        this.currentCooldown = 0;
    }

    update(player) {
        this.currentCooldown -= deltaTime;
        
        if(player.attacking && this.currentCooldown <= 0) {
            this.executeAttack(player);
            this.currentCooldown = this.attackCooldown;
        }
    }

    executeAttack(player) {
        // Lógica de dano baseada na classe
        const damage = this.calculateDamage(player);
        // Verificar colisão com inimigos
    }
}