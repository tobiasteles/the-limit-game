import { auth } from '../firebase/auth.js';
import { playerDB, realtimeDB } from '../firebase/db.js';
import { Player } from './Player.js';

export function initCharacterCreation() {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('Iniciando criação de personagem...');

        const classSelector = document.querySelector('.class-selector');
        if (!classSelector) return;

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
            card.addEventListener('click', (event) => selectClass(event, cls)); // Corrigido aqui
            classSelector.appendChild(card);
        });

        // Único listener para o botão
        document.getElementById('createCharacter').addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('Botão clicado');

            const userId = auth.currentUser?.uid;
            console.log('User ID:', userId);

            if (!userId) {
                alert('Usuário não autenticado!');
                return window.location.href = '/';
            }

            const characterName = document.getElementById('characterName').value;
            const selectedClass = document.querySelector('.class-card.selected')?.dataset.class;

            if (!selectedClass || !characterName) {
                alert('Selecione uma classe e digite um nome!');
                return;
            }

            try {
                const canCreate = await playerDB.canCreateNewCharacter(userId);
                if (!canCreate) throw new Error('Limite de 3 personagens atingido!');

                const characterData = {
                    name: characterName,
                    class: selectedClass,
                    stats: new Player({ class: selectedClass }).stats,
                    created: new Date()
                };

                console.log('Dados do personagem:', characterData);
                
                const characterId = await playerDB.createCharacter(userId, characterData);
                console.log('Personagem criado com ID:', characterId);
                
                await realtimeDB.initPlayerStatus(userId, characterId, characterData.stats);
                alert('Personagem criado com sucesso!');
                
                window.location.href = '/game.html';
            } catch (error) {
                console.error('Erro na criação:', error);
                alert(`Erro: ${error.message}`);
            }
        });
    });
}

// Adicionado parâmetro event
function selectClass(event, cls) {
    document.querySelectorAll('.class-card').forEach(card => {
        card.classList.remove('selected');
        card.style.borderColor = '';
    });
    
    const selectedCard = event.currentTarget;
    selectedCard.classList.add('selected');
    selectedCard.dataset.class = cls.id;
    updateSpriteVisual(cls);
}

function updateSpriteVisual(cls) {
    const sprite = document.getElementById('sprite');
    if (sprite) {
        sprite.style.backgroundColor = cls.color;
    }
}