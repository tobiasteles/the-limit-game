export class Player {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.class = data.class;
        this.level = data.level || 1;
        this.exp = data.exp || 0;
        this.weapon = this.getInitialWeapon(data.class);
        this.stats = this.getClassStats(data.class);
        this.spriteConfig = data.spriteConfig || {};
    }

    getInitialWeapon(characterClass) {
        const weapons = {
            warrior: 'Espada Longa',
            knight: 'Lança de Cavalaria',
            archer: 'Arco Recurvo',
            mage: 'Cajado Elemental',
            assassin: 'Adagas Gêmeas',
            necromancer: 'Grimório Sombrio'
        };
        return weapons[characterClass] || 'Arma Desconhecida';
    }

    getClassStats(characterClass) {
        // Status base para todas as classes
        const baseStats = {
            hp: 100,
            mp: 50,
            attack: 10,
            defense: 10,
            agility: 10
        };

        // Modificadores específicos por classe
        const classModifiers = {
            warrior: { hp: +30, attack: +15, defense: +10 },
            knight: { hp: +40, defense: +20, agility: -5 },
            archer: { agility: +20, attack: +10 },
            mage: { mp: +50, attack: +20, defense: -5 },
            assassin: { agility: +30, attack: +15, hp: -20 },
            necromancer: { mp: +30, attack: +25, defense: -10 }
        };

        // Aplica modificadores e calcula valores finais
        const calculatedStats = { ...baseStats };
        const modifiers = classModifiers[characterClass] || {};

        for (const [stat, value] of Object.entries(modifiers)) {
            calculatedStats[stat] += value;
        }

        // Validações para garantir valores mínimos
        return {
            hp: Math.max(calculatedStats.hp, 10),       // HP mínimo de 10
            mp: Math.max(calculatedStats.mp, 10),       // MP mínimo de 10
            attack: Math.max(calculatedStats.attack, 5),// Ataque mínimo 5
            defense: Math.max(calculatedStats.defense, 0), // Defesa não pode ser negativa
            agility: Math.max(calculatedStats.agility, 5) // Agilidade mínima 5
        };
    }
}