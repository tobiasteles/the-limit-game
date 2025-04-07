import { auth } from '../firebase/auth.js';
import { playerDB, realtimeDB } from '../firebase/db.js';
import { Player } from './Player.js';

export function initCharacterCreation() {
    console.log('Iniciando criação de personagem...');

    // Elementos da UI
    const classSelector = document.querySelector('.class-selector');
    const createButton = document.getElementById('createCharacter');
    const characterNameInput = document.getElementById('characterName');

    if (!classSelector || !createButton || !characterNameInput) {
        console.error('Elementos da UI não encontrados!');
        return;
    }

    // Configuração das classes
    const classes = [
        { id: 'warrior', color: '#FF5555', weapon: 'Espada Longa' },
        { id: 'knight', color: '#9999FF', weapon: 'Lança de Cavalaria' },
        { id: 'archer', color: '#55FF55', weapon: 'Arco Recurvo' },
        { id: 'mage', color: '#FF55FF', weapon: 'Cajado Elemental' },
        { id: 'assassin', color: '#5555FF', weapon: 'Adagas Gêmeas' },
        { id: 'necromancer', color: '#AA00AA', weapon: 'Grimório Sombrio' }
    ];

    // Renderização das classes
    classes.forEach(cls => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.innerHTML = `
            <h3>${cls.id.toUpperCase()}</h3>
            <p>${cls.weapon}</p>
        `;
        card.dataset.class = cls.id; // Adiciona o dataset
        card.addEventListener('click', (event) => selectClass(event, cls));
        classSelector.appendChild(card);
    });

    // Evento de criação
    createButton.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('[DEBUG] Botão pressionado - Início do processo');
        console.log('[DEBUG] Botão de criação clicado');

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Usuário não autenticado!');
            }
            console.log('[DEBUG] Usuário autenticado:', user.uid);

            const characterName = characterNameInput.value.trim();
            const selectedClass = document.querySelector('.class-card.selected')?.dataset.class;
            console.log('[DEBUG] Classe selecionada:', selectedClass);

            // Validação de entrada
            if (!selectedClass) {
                throw new Error('Selecione uma classe!');
            }
            if (!characterName || characterName.length < 3) {
                throw new Error('Nome deve ter pelo menos 3 caracteres!');
            }
            console.log('[DEBUG] Dados validados:', { characterName, selectedClass });

            // Verifica limite de personagens
            const canCreate = await playerDB.canCreateNewCharacter(user.uid);
            if (!canCreate) {
                throw new Error('Limite de 3 personagens atingido!');
            }

            // Cria dados do personagem
            const characterData = {
                name: characterName,
                class: selectedClass,
                stats: new Player({ class: selectedClass }).stats,
                created: new Date().toISOString() // Formato ISO para Firestore
            };

            console.log('Enviando dados:', characterData);
            console.log('[DEBUG] Chamando playerDB.createCharacter...');

            // Salva no Firestore
            const characterId = await playerDB.createCharacter(user.uid, characterData);
            console.log('[DEBUG] Personagem criado com ID:', characterId);

            console.log('[DEBUG] Inicializando status no RTDB...');
            // Salva status inicial no Realtime Database
            await realtimeDB.initPlayerStatus(user.uid, characterId, characterData.stats);

            // Feedback e redirecionamento
            createButton.textContent = '✔️ Personagem Criado!';
            createButton.disabled = true;
            setTimeout(() => {
                window.location.href = '/game.html';
            }, 1500);

        } catch (error) {
            console.error('Erro completo:', error);
            alert(`ERRO: ${error.message}`);
            createButton.textContent = 'Tentar Novamente';
        }
    });
}

// Funções auxiliares
function selectClass(event, cls) {
    // Remove seleção anterior
    document.querySelectorAll('.class-card').forEach(card => {
        card.classList.remove('selected');
    });

    // Adiciona nova seleção
    const card = event.currentTarget;
    card.classList.add('selected');
    updateSpriteVisual(cls);
}

function updateSpriteVisual(cls) {
    const sprite = document.getElementById('sprite');
    if (sprite) {
        sprite.style.backgroundColor = cls.color;
        sprite.style.boxShadow = `0 0 15px ${cls.color}`;
    }
}
