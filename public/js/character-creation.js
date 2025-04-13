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

async function createCharacter() {
    const selectedClass = classes[currentClassIndex];
    const characterName = document.getElementById('characterName').value.trim();
    const user = firebase.auth().currentUser;

    if (!characterName) {
        alert('Digite um nome para o herói!');
        return;
    }

    if (!user) {
        alert('Usuário não autenticado!');
        return;
    }

    const newCharacter = {
        name: characterName,
        class: selectedClass.name,
        level: 1,
        stats: selectedClass.stats,
        spritePath: selectedClass.sprite,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await firebase.firestore()
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

// Adicione contador de caracteres
document.getElementById('characterName').addEventListener('input', function(e) {
    document.getElementById('nameCounter').textContent = `${e.target.value.length}/20`;
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateClassDisplay();
    
    // Preencher grid de classes
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
});