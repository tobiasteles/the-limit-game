export class Player {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.class = data.class;
        this.level = data.level || 1;
        this.exp = data.exp || 0;
        this.weapon = data.weapon || this.getInitialWeapon();
        this.stats = this.getClassStats();
        this.spriteConfig = data.spriteConfig || {};
    }

    getInitialWeapon() {
        const weapons = {
            warrior: 'Espada Longa',
            knight: 'Lança de Cavalaria',
            archer: 'Arco Recurvo',
            mage: 'Cajado Elemental',
            assassin: 'Adagas Gêmeas',
            necromancer: 'Grimório Sombrio'
        };
        return weapons[this.class];
    }

    getClassStats() {
        const baseStats = {
            hp: 100,
            mp: 50,
            attack: 10,
            defense: 10,
            agility: 10
        };

        const classModifiers = {
            warrior: { hp: +30, attack: +15, defense: +10 },
            knight: { hp: +40, defense: +20, agility: -5 },
            archer: { agility: +20, attack: +10 },
            mage: { mp: +50, attack: +20, defense: -5 },
            assassin: { agility: +30, attack: +15, hp: -20 },
            necromancer: { mp: +30, attack: +25, defense: -10 }
        };

        return Object.assign(baseStats, classModifiers[this.class]);
    }
}