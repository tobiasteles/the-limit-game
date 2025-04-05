import { playerDB } from '/public/js/firebase/db.js';

export class Player {
    constructor(uid) {
        this.uid = uid;
        this.level = 1;
        this.xp = 0;
        this.inventory = [];
        this.position = { x: 400, y: 300 };
        this.autoSaveInterval = null;
    }

    async save() {
        await playerDB.savePlayer(this);
    }

    async load() {
        const data = await playerDB.loadPlayer(this.uid);
        if (data) {
            Object.assign(this, data);
        }
    }


    // Sistema de progressão infinito
    gainXP(amount) {
        this.xp += amount;
        const xpRequired = this.calculateXPRequired();
        
        while (this.xp >= xpRequired) {
            this.xp -= xpRequired;
            this.level++;
        }
    }

    calculateXPRequired() {
        return 100 * Math.pow(this.level, 1.5); // Fórmula exponencial
    }

    // Inventário
    addItem(item) {
        this.inventory.push(item);
    }

    removeItem(itemId) {
        this.inventory = this.inventory.filter(item => item.id !== itemId);
    }

    // Salvar no Firestore
    async save() {
        await db.collection('players').doc(this.uid).set({
            level: this.level,
            xp: this.xp,
            inventory: this.inventory,
            position: this.position
        });
    }

    startAutoSave() {
        this.autoSaveInterval = setInterval(async () => {
            await this.save();
            console.log('Progresso salvo automaticamente');
        }, 30000); // 30 segundos

        window.addEventListener('beforeunload', this.save.bind(this));
    }

    stopAutoSave() {
        clearInterval(this.autoSaveInterval);
    }

    // Carregar do Firestore
    static async load(uid) {
        const doc = await db.collection('players').doc(uid).get();
        const data = doc.data();
        const player = new Player(uid);
        Object.assign(player, data);
        return player;
    }
}
