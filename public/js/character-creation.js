document.addEventListener('DOMContentLoaded', () => {
    let selectedCharacterId = null;
    const charactersGrid = document.getElementById('characters-grid');
    const savedCharacters = JSON.parse(localStorage.getItem('characters')) || [];

    // Carregar personagens salvos
    function loadCharacters() {
        charactersGrid.innerHTML = '';
        
        savedCharacters.forEach(character => {
            const characterCard = document.createElement('div');
            characterCard.className = 'character-card';
            characterCard.innerHTML = `
                <img src="${character.sprite}" alt="${character.name}">
                <h3>${character.name}</h3>
                <p>Nível ${character.level}</p>
                <p>Classe: ${character.class}</p>
            `;
            
            characterCard.addEventListener('click', () => {
                // Remover seleção anterior
                document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
                // Selecionar novo
                characterCard.classList.add('selected');
                selectedCharacterId = character.id;
            });
            
            charactersGrid.appendChild(characterCard);
        });
    }

    // Botão de confirmar
    document.getElementById('btn-confirm').addEventListener('click', () => {
        if(selectedCharacterId) {
            const selectedCharacter = savedCharacters.find(c => c.id === selectedCharacterId);
            localStorage.setItem('selectedCharacter', JSON.stringify(selectedCharacter));
            window.location.href = 'game.html'; // Arquivo principal do jogo
        } else {
            alert('Selecione um personagem!');
        }
    });

    // Botão de criação já está no HTML via onclick

    // Carregar inicial
    loadCharacters();
});