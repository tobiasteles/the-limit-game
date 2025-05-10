// public/js/game/weapons/classWeapons.js

export const CLASS_WEAPONS = {
    "Guerreiro": {
        type: "Espada de Duas Mãos",
        materials: {
            25: { // Nível 25
                name: "Ferro",
                atk: 15,
                def: 5,
                price: 1000
            },
            50: { // Nível 50
                name: "Aço",
                atk: 30,
                def: 10,
                price: 2500
            },
            75: { // Nível 75
                name: "Ébano",
                atk: 45,
                def: 15,
                price: 5000
            },
            100: { // Nível 100
                name: "Dragônico",
                atk: 60,
                def: 20,
                price: 10000
            }
        }
    },
    "Cavaleiro": {
        type: "Espada e Escudo",
        materials: {
            25: {
                name: "Bronze",
                atk: 10,
                def: 20,
                price: 1000
            },
            50: {
                name: "Prata",
                atk: 20,
                def: 35,
                price: 2500
            },
            75: {
                name: "Ouro",
                atk: 30,
                def: 50,
                price: 5000
            },
            100: {
                name: "Adamantium",
                atk: 40,
                def: 65,
                price: 10000
            }
        }
    },
    "Assassino": {
        type: "Adagas Gêmeas",
        materials: {
            25: {
                name: "Obsidiana",
                atk: 25,
                def: 2,
                price: 1000
            },
            50: {
                name: "Jade",
                atk: 40,
                def: 5,
                price: 2500
            },
            75: {
                name: "Vibranium",
                atk: 55,
                def: 8,
                price: 5000
            },
            100: {
                name: "Fênix",
                atk: 70,
                def: 12,
                price: 10000
            }
        }
    },
    "Arqueiro": {
        type: "Arco Longo",
        materials: {
            25: {
                name: "Carvalho",
                atk: 20,
                def: 5,
                price: 1000
            },
            50: {
                name: "Teixo",
                atk: 35,
                def: 8,
                price: 2500
            },
            75: {
                name: "Ébano",
                atk: 50,
                def: 12,
                price: 5000
            },
            100: {
                name: "Cristal",
                atk: 65,
                def: 15,
                price: 10000
            }
        }
    },
    "Mago": {
        type: "Cajado Arcano",
        materials: {
            25: {
                name: "Carvalho",
                atk: 25,
                def: 0,
                price: 1000
            },
            50: {
                name: "Cristal",
                atk: 40,
                def: 0,
                price: 2500
            },
            75: {
                name: "Éter",
                atk: 55,
                def: 0,
                price: 5000
            },
            100: {
                name: "Estelar",
                atk: 70,
                def: 0,
                price: 10000
            }
        }
    },
    "Necromancer": {
        type: "Cetro das Trevas",
        materials: {
            25: {
                name: "Osso",
                atk: 20,
                def: 10,
                price: 1000
            },
            50: {
                name: "Ébano",
                atk: 35,
                def: 15,
                price: 2500
            },
            75: {
                name: "Alma",
                atk: 50,
                def: 20,
                price: 5000
            },
            100: {
                name: "Abissal",
                atk: 65,
                def: 25,
                price: 10000
            }
        }
    }
};

// Função para calcular preço de melhoria
export function calculateWeaponPrice(basePrice, targetLevel) {
    const multiplier = (targetLevel / 25) * 0.75;
    return Math.round(basePrice * multiplier);
}