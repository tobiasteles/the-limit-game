// character-selection.js
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'index.html';
        } else {
            loadCharacters(user.uid);
            setupEventListeners();
        }
    });

    const MAX_CHARACTERS = 6;

    async function loadCharacters(userId) {
        const charactersGrid = document.getElementById('charactersGrid');
        charactersGrid.innerHTML = '<div class="loading">Carregando heróis...</div>';

        try {
            const snapshot = await db.collection('players').doc(userId).collection('characters')
                .orderBy('createdAt', 'desc')
                .get();

            charactersGrid.innerHTML = '';
            
            snapshot.forEach(doc => {
                const character = doc.data();
                const card = createCharacterCard(doc.id, character);
                charactersGrid.appendChild(card);
            });

            updateCreateButton(snapshot.size);
        } catch (error) {
            console.error('Erro ao carregar personagens:', error);
            showMessage('Erro ao carregar personagens!');
        }
    }

    function createCharacterCard(id, { name, class: className, level, spritePath }) {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <button class="delete-button" data-id="${id}">×</button>
            <img src="${spritePath}" class="character-sprite" alt="${name}" onerror="this.src='assets/default-character.png'">
            <h3 class="character-name">${name}</h3>
            <p class="character-class">${className} - Nível ${level}</p>
            <button class="select-button">Entrar no Mundo</button>
        `;

        card.querySelector('.delete-button').addEventListener('click', deleteCharacter);
        card.querySelector('.select-button').addEventListener('click', () => enterGame(id));
        return card;
    }

    async function deleteCharacter(e) {
        const characterId = e.target.dataset.id;
        if (!characterId) return;

        const confirmDelete = confirm('Tem certeza que deseja apagar este herói?');
        if (!confirmDelete) return;

        try {
            const userId = auth.currentUser?.uid;
            if (!userId) throw new Error('Usuário não autenticado');

            await db.collection('players').doc(userId).collection('characters').doc(characterId).delete();
            e.target.closest('.character-card').remove();
            showMessage('Personagem deletado com sucesso!');
        } catch (error) {
            console.error('Erro ao deletar personagem:', error);
            showMessage('Erro ao deletar personagem!');
        }
    }

    function updateCreateButton(currentCount) {
        const createBtn = document.getElementById('createNew');
        if (!createBtn) return;

        createBtn.disabled = currentCount >= MAX_CHARACTERS;
        createBtn.title = currentCount >= MAX_CHARACTERS 
            ? 'Limite máximo de personagens atingido' 
            : 'Criar novo personagem';
    }

    function enterGame(characterId) {
        if (!characterId) {
            showMessage('Selecione um personagem válido!');
            return;
        }

        // Salva em múltiplos locais para redundância
        localStorage.setItem('selectedCharacterId', characterId);
        sessionStorage.setItem('selectedCharacterId', characterId);
        
        // Redireciona com o ID na URL
        window.location.href = `game.html?characterId=${encodeURIComponent(characterId)}`;
    }

    function setupEventListeners() {
        document.getElementById('btn-confirm')?.addEventListener('click', () => {
            const selected = document.querySelector('.character-card.selected');
            if (selected) {
                const characterId = selected.dataset.id;
                enterGame(characterId);
            } else {
                showMessage('Selecione um personagem primeiro!');
            }
        });
    }

    function showMessage(message, duration = 5000) {
        const msgElement = document.getElementById('authMessage');
        if (!msgElement) return;

        msgElement.textContent = message;
        msgElement.style.display = 'block';
        setTimeout(() => msgElement.style.display = 'none', duration);
    }
});