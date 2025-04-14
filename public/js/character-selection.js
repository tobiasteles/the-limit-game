// Adicione no TOPO do arquivo
const auth = firebase.auth();
const db = firebase.firestore();

// Modifique o início do código para:
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'index.html';
        } else {
            loadCharacters(user.uid);
        }
    });
    
    // Resto do seu código...
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
        }
    }

    function createCharacterCard(id, { name, class: className, level, spritePath }) {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <button class="delete-button" data-id="${id}">×</button>
            <img src="${spritePath}" class="character-sprite" alt="${name}">
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
        const confirmDelete = confirm('Tem certeza que deseja apagar este herói?');
        
        if (confirmDelete) {
            try {
                const userId = auth.currentUser.uid;
                await db.collection('players').doc(userId).collection('characters').doc(characterId).delete();
                e.target.closest('.character-card').remove();
            } catch (error) {
                console.error('Erro ao deletar personagem:', error);
            }
        }
    }

    function updateCreateButton(currentCount) {
        const createBtn = document.getElementById('createNew');
        createBtn.disabled = currentCount >= MAX_CHARACTERS;
        createBtn.title = currentCount >= MAX_CHARACTERS 
            ? 'Limite máximo de personagens atingido' 
            : 'Criar novo personagem';
    }


    function enterGame(characterId) {
        // Implementar lógica de entrada no jogo
        console.log('Entrando no jogo com personagem:', characterId);
        window.location.href = `game.html?characterId=${characterId}`;
    }
});
