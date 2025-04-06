import { playerDB } from '../firebase/db.js';

export class Player {
    constructor(uid) {
        this.uid = uid;
        this.level = 1;
        this.xp = 0;
        this.inventory = []; // ou instancie a classe Inventory se preferir
        this.position = { x: 400, y: 300 };
        this.autoSaveInterval = null;
        this.health = 100; // valor inicial de vida
    }

    // Salva o jogador usando o playerDB
    async save() {
        await playerDB.savePlayer(this);
    }

    async load() {
        const data = await playerDB.loadPlayer(this.uid);
        if (data) {
            Object.assign(this, data);
        }
    }

    // Progressão do jogador
    gainXP(amount) {
        this.xp += amount;
        const xpRequired = this.calculateXPRequired();
        
        while (this.xp >= xpRequired) {
            this.xp -= xpRequired;
            this.level++;
        }
    }

    calculateXPRequired() {
        return 100 * Math.pow(this.level, 1.5);
    }

    // Inventário
    addItem(item) {
        this.inventory.push(item);
    }

    removeItem(itemId) {
        this.inventory = this.inventory.filter(item => item.id !== itemId);
    }

    startAutoSave() {
        this.autoSaveInterval = setInterval(async () => {
            await this.save();
            console.log('Progresso salvo automaticamente');
        }, 30000);

        window.addEventListener('beforeunload', this.save.bind(this));
    }

    stopAutoSave() {
        clearInterval(this.autoSaveInterval);
    }

    // Carrega jogador do playerDB
    static async load(uid) {
        const data = await playerDB.loadPlayer(uid);
        const player = new Player(uid);
        if (data) {
            Object.assign(player, data);
        }
        return player;
    }

    // Aplica dano ao jogador
    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }
}

// Classe Inventory opcional, definida externamente se for necessária
export class Inventory {
    constructor() {
        this.items = {
            weapons: [],
            armor: [],
            consumables: []
        };
        this.gold = 0;
    }

    addItem(item) {
        switch(item.type) {
            case 'weapon':
                this.items.weapons.push(item);
                break;
            case 'armor':
                this.items.armor.push(item);
                break;
            case 'consumable':
                this.items.consumables.push(item);
                break;
            case 'gold':
                this.gold += item.amount;
                break;
        }
        this.updateUI();
    }

    updateUI() {
        // Atualize a interface do usuário conforme necessário
        console.log("UI do inventário atualizada");
    }

    // Adicione no Player.js
update(delta) {
    this.targetX = this.position.x + (this.movementVector.x * delta * 0.2);
    this.targetY = this.position.y + (this.movementVector.y * delta * 0.2);
    
    // Interpolação
    this.position.x += (this.targetX - this.position.x) * 0.1;
    this.position.y += (this.targetY - this.position.y) * 0.1;
}
}
