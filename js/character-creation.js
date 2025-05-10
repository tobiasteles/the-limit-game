// Adicione no início do arquivo
const auth = firebase.auth();
const db = firebase.firestore();

const classes = [
    {
        name: "Guerreiro",
        sprite: "assets/sprites/warrior.png",
        desc: "Mestre do combate corpo a corpo com armas pesadas",
        stats: { atk: 80, def: 65, spd: 45 }
    },
    {
        name: "Cavaleiro",
        sprite: "assets/sprites/knight.png",
        desc: "Defensor com armadura pesada e escudo imponente",
        stats: { atk: 60, def: 85, spd: 40 }
    },
    {
        name: "Assassino",
        sprite: "assets/sprites/assassin.png",
        desc: "Especialista em ataques rápidos e furtivos",
        stats: { atk: 75, def: 50, spd: 90 }
    },
    {
        name: "Arqueiro",
        sprite: "assets/sprites/archer.png",
        desc: "Atirador preciso com arcos de longo alcance",
        stats: { atk: 70, def: 55, spd: 75 }
    },
    {
        name: "Mago",
        sprite: "assets/sprites/mage.png",
        desc: "Manipulador de elementos arcanos e energia pura",
        stats: { atk: 90, def: 40, spd: 60 }
    },
    {
        name: "Necromancer",
        sprite: "assets/sprites/necromancer.png",
        desc: "Controlador de energias sombrias e mortos-vivos",
        stats: { atk: 85, def: 45, spd: 55 }
    }
];

const CLASS_WEAPONS = {
    Guerreiro: {
        type: 'Espada de Duas Mãos',
        materials: gerarMateriais()
    },
    Cavaleiro: {
        type: 'Espada e Escudo',
        materials: gerarMateriais()
    },
    Assassino: {
        type: 'Adagas Gêmeas',
        materials: gerarMateriais()
    },
    Arqueiro: {
        type: 'Arco Longo',
        materials: gerarMateriais()
    },
    Mago: {
        type: 'Cajado Arcano',
        materials: gerarMateriais()
    },
    Necromancer: {
        type: 'Cetro das Trevas',
        materials: gerarMateriais()
    }
};

function gerarMateriais() {
    const materiais = {};
    for (let i = 1; i <= 100; i++) {
        materiais[i] = { atk: 5 + i }; // Exemplo: ATQ aumenta com o nível do material
    }
    return materiais;
}

let currentClassIndex = 0;

function updateClassDisplay() {
    const currentClass = classes[currentClassIndex];
    
    document.getElementById('class-sprite').src = currentClass.sprite;
    document.getElementById('class-name').textContent = currentClass.name.toUpperCase();
    document.getElementById('class-desc').textContent = currentClass.desc;
    
    document.querySelectorAll('.attr .bar').forEach((bar, index) => {
        const stats = Object.values(currentClass.stats);
        bar.style.width = `${stats[index]}%`;
    });
}

function nextClass() {
    currentClassIndex = (currentClassIndex + 1) % classes.length;
    updateClassDisplay();
}

function previousClass() {
    currentClassIndex = (currentClassIndex - 1 + classes.length) % classes.length;
    updateClassDisplay();
}

function getWeaponIcon(weaponType) {
    const icons = {
        'Espada de Duas Mãos': 'assets/weapons/greatsword.png',
        'Espada e Escudo': 'assets/weapons/swordshield.png',
        'Adagas Gêmeas': 'assets/weapons/daggers.png',
        'Arco Longo': 'assets/weapons/bow.png',
        'Cajado Arcano': 'assets/weapons/staff.png',
        'Cetro das Trevas': 'assets/weapons/scepter.png'
    };
    return icons[weaponType] || 'assets/weapons/default.png';
}

// Função para criar personagem
async function createCharacter() {
    const user = auth.currentUser;
    if (!user) {
        alert('Faça login antes de criar um personagem!');
        window.location.href = 'index.html';
        return;
    }

    const selectedClass = classes[currentClassIndex];
    const characterName = document.getElementById('characterName').value.trim();

    if (!characterName) {
        alert('Digite um nome para o herói!');
        return;
    }

    const weaponType = CLASS_WEAPONS[selectedClass.name].type;
    const weaponStats = CLASS_WEAPONS[selectedClass.name].materials[25];

    const newCharacter = {
        name: characterName,
        class: selectedClass.name,
        level: 1,
        stats: selectedClass.stats,
        attributes: {
            str: selectedClass.stats.atk,
            int: selectedClass.name === 'Mago' || selectedClass.name === 'Necromancer' ? 15 : 10,
            spd: selectedClass.stats.spd
        },
        availablePoints: 0,
        spritePath: selectedClass.sprite,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        gold: 1000,
        inventory: {
            mainHand: {
                name: `${weaponType} Ferro`,
                icon: getWeaponIcon(weaponType),
                type: 'weapon',
                stats: weaponStats,
                level: 1
            }
        },
        weapon: {
            type: weaponType,
            level: 1,
            currentMaterial: 'Ferro',
            stats: weaponStats
        }
    };

    try {
        await db
            .collection('players')
            .doc(user.uid)
            .collection('characters')
            .add(newCharacter);

        window.location.href = 'character-selection.html';
    } catch (error) {
        console.error('Erro ao criar personagem:', error);
        alert('Erro ao criar personagem!');
    }
}

// Contador de caracteres
document.getElementById('characterName').addEventListener('input', function(e) {
    document.getElementById('nameCounter').textContent = `${e.target.value.length}/20`;
});

// Verificação de autenticação no carregamento
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'index.html';
        } else {
            try {
                updateClassDisplay();
                
                const grid = document.getElementById('class-grid');
                classes.forEach((cls, index) => {
                    const classItem = document.createElement('div');
                    classItem.className = 'class-item';
                    classItem.innerHTML = `
                        <img src="${cls.sprite}" alt="${cls.name}" class="class-thumb">
                        <p>${cls.name}</p>
                    `;
                    classItem.onclick = () => {
                        currentClassIndex = index;
                        updateClassDisplay();
                    };
                    grid.appendChild(classItem);
                });
            } catch (error) {
                console.error('Erro na inicialização:', error);
                alert('Erro ao carregar a criação de personagem!');
            }
        }
    });
});
